export type SessionTokens = { Token: string; RefreshToken?: string };

export type SessionStore = {
  read(): Promise<SessionTokens | null>;
  replace(expected: SessionTokens, next: SessionTokens | null): Promise<boolean>;
};

export class SessionExpiredError extends Error {
  readonly status = 401;
  readonly code = 'SESSION_EXPIRED';
  constructor() { super('Tu sesiÃ³n venciÃ³. Inicia sesiÃ³n nuevamente.'); }
}

export const sameSession = (a: SessionTokens | null, b: SessionTokens): boolean =>
  a?.Token === b.Token && a?.RefreshToken === b.RefreshToken;

export function createSessionTransport(options: {
  store: SessionStore;
  apiBaseUrl: () => string;
  trustedBases: () => string[];
  decodeBase64: (value: string) => string;
  fetch?: typeof globalThis.fetch;
}) {
  const send = options.fetch ?? globalThis.fetch.bind(globalThis);
  let renewing: { key: string; promise: Promise<SessionTokens> } | null = null;

  const claims = (token: string): { id?: number; role?: string; exp?: number } => {
    try {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(options.decodeBase64(payload.padEnd(Math.ceil(payload.length / 4) * 4, '=')));
    } catch { return {}; }
  };

  const identityMatches = (a: string, b: string): boolean => {
    if (a === b) return true;
    const left = claims(a), right = claims(b);
    return Number(left.id) > 0 && Number(left.id) === Number(right.id)
      && !!left.role && left.role === right.role;
  };

  const trusted = (input: string): boolean => {
    try {
      const url = new URL(input);
      return options.trustedBases().some(base => {
        if (!base) return false;
        const allowed = new URL(base);
        const prefix = allowed.pathname.replace(/\/+$/, '');
        return url.origin === allowed.origin
          && (url.pathname === prefix || url.pathname.startsWith(`${prefix}/`));
      });
    } catch { return false; }
  };

  const refresh = async (snapshot: SessionTokens): Promise<SessionTokens> => {
    if (!snapshot.RefreshToken) throw new SessionExpiredError();
    const key = snapshot.RefreshToken;
    if (renewing?.key === key) return renewing.promise;
    const promise = (async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await send(`${options.apiBaseUrl().replace(/\/+$/, '')}/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ RefreshToken: key }),
          signal: controller.signal,
        });
        if (response.status === 400 || response.status === 401 || response.status === 403) {
          await options.store.replace(snapshot, null);
          throw new SessionExpiredError();
        }
        if (!response.ok) throw new Error(`No se pudo renovar la sesiÃ³n (${response.status}).`);
        const pair = await response.json() as SessionTokens;
        if (!pair.Token || !pair.RefreshToken || !identityMatches(snapshot.Token, pair.Token)) {
          throw new Error('Respuesta de renovaciÃ³n de sesiÃ³n invÃ¡lida.');
        }
        if (await options.store.replace(snapshot, pair)) return pair;
        const current = await options.store.read();
        if (!current || !identityMatches(snapshot.Token, current.Token)) throw new SessionExpiredError();
        return current;
      } finally { clearTimeout(timer); }
    })();
    renewing = { key, promise };
    try { return await promise; }
    finally { if (renewing?.promise === promise) renewing = null; }
  };

  const ensureSession = async (): Promise<SessionTokens | null> => {
    const current = await options.store.read();
    if (!current) return null;
    const expiration = Number(claims(current.Token).exp);
    if (expiration && expiration * 1000 <= Date.now() + 30000) {
      if (current.RefreshToken) return refresh(current);
      if (expiration * 1000 <= Date.now()) {
        await options.store.replace(current, null);
        throw new SessionExpiredError();
      }
    }
    return current;
  };

  const fetchSession = async (input: string, init: RequestInit = {}): Promise<Response> => {
    if (!trusted(input)) return send(input, init);
    const path = new URL(input).pathname;
    // Login and recovery must never refresh or borrow another active session.
    const method = (init.method ?? 'GET').toUpperCase();
    if ((/\/(?:login|logincustomer|adminlogin|logup|logupcustomer|refresh-token|resetpassword|comparepasswordanswers(?:customer)?)(?:\/[^/]+)?\/?$/i.test(path)
      && method !== 'GET') || (method === 'POST' && /\/business\/?$/i.test(path))) return send(input, init);
    const headers = new Headers(init.headers);
    const legacy = headers.get('token');
    const bearer = headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
    if (legacy && bearer && legacy !== bearer) return send(input, init);
    const explicit = legacy || bearer;
    const original = await options.store.read();
    if (!original || (explicit && !identityMatches(explicit, original.Token))) return send(input, init);
    let session = await ensureSession();
    if (!session || !identityMatches(original.Token, session.Token)) throw new SessionExpiredError();
    const request = () => {
      headers.set('Authorization', `Bearer ${session!.Token}`);
      headers.set('token', session!.Token);
      return send(input, { ...init, headers });
    };
    let response = await request();
    if (response.status === 401 && session.RefreshToken) {
      const latest = await options.store.read();
      if (!latest || !identityMatches(session.Token, latest.Token)) return response;
      session = sameSession(latest, session) ? await refresh(session) : latest;
      if (init.signal?.aborted) throw new Error('Solicitud cancelada.');
      response = await request();
    }
    const renewed = response.headers.get('x-access-token');
    if (response.ok && renewed && renewed !== session.Token && identityMatches(session.Token, renewed)) {
      await options.store.replace(session, { ...session, Token: renewed });
    }
    return response;
  };
  const authenticatedFetch = async (input: string, init: RequestInit = {}): Promise<Response> => {
    try { return await fetchSession(input, init); }
    catch (error) {
      if (!(error instanceof SessionExpiredError)) throw error;
      return new Response(JSON.stringify({message: error.message, code: error.code}), {
        status: 401, headers: {'Content-Type': 'application/json', 'Cache-Control': 'no-store'},
      });
    }
  };
  return { authenticatedFetch, ensureSession };
}
