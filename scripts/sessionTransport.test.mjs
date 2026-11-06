import test from 'node:test';
import assert from 'node:assert/strict';
import {createSessionTransport, sameSession} from '../src/new/core/api/sessionTransport.ts';

const token = (id = 1, expires = 3600, marker = '') =>
  `header.${Buffer.from(JSON.stringify({id, role: 'ADMINISTRADOR', exp: Math.floor(Date.now()/1000) + expires})).toString('base64url')}.${marker}`;
const reply = (body = {}, status = 200, headers = {}) => new Response(JSON.stringify(body), {status, headers});
const setup = (handler, initial = {Token: token(), RefreshToken: 'refresh-1'}) => {
  let stored = initial;
  const calls = [];
  const store = {
    async read() { return stored; },
    async replace(expected, next) {
      if (!sameSession(stored, expected)) return false;
      stored = next;
      return true;
    },
  };
  const client = createSessionTransport({store,
    apiBaseUrl: () => 'https://api.example/api/',
    trustedBases: () => ['https://api.example/api/', 'https://ai.example'],
    decodeBase64: value => Buffer.from(value, 'base64').toString(),
    fetch: async (url, init) => {
      calls.push({url, ...init, headers: new Headers(init?.headers)});
      return handler(url, init, calls.length);
    },
  });
  return {...client, calls, read: () => stored, set: value => {stored = value;}};
};

test('adds only access token, saves renewed response token', async () => {
  const renewed = token(1, 7200);
  const client = setup(() => reply({}, 200, {'x-access-token': renewed}));
  const originalToken = client.read().Token;
  await client.authenticatedFetch('https://api.example/api/orders');
  assert.equal(client.calls[0].headers.get('Authorization'), `Bearer ${originalToken}`);
  assert.equal(client.calls[0].headers.get('RefreshToken'), null);
  assert.equal(client.read().Token, renewed);
});

test('concurrent expired requests share one refresh, persist both tokens', async () => {
  const pair = {Token: token(1, 7200), RefreshToken: 'refresh-2'};
  const client = setup(async url => {
    if (url.endsWith('refresh-token')) { await new Promise(resolve => setTimeout(resolve, 10)); return reply(pair); }
    return reply();
  }, {Token: token(1, -10), RefreshToken: 'refresh-1'});
  await Promise.all(Array.from({length: 5}, () => client.authenticatedFetch('https://api.example/api/orders')));
  const refreshes = client.calls.filter(call => call.url.endsWith('refresh-token'));
  assert.equal(refreshes.length, 1);
  assert.deepEqual(JSON.parse(refreshes[0].body), {RefreshToken: 'refresh-1'});
  assert.equal(refreshes[0].headers.get('Authorization'), null);
  assert.deepEqual(client.read(), pair);
  assert(client.calls.filter(call => !call.url.endsWith('refresh-token')).every(call => call.headers.get('token') === pair.Token));
});

test('401 retries once with identical mutation body and idempotency key', async () => {
  let attempts = 0;
  const fresh = token(1, 7200);
  const client = setup(url => url.endsWith('refresh-token')
    ? reply({Token: fresh, RefreshToken: 'refresh-2'}) : reply({}, ++attempts === 1 ? 401 : 200));
  const body = JSON.stringify({Total: 100});
  const result = await client.authenticatedFetch('https://api.example/api/orders', {
    method: 'POST', body, headers: {'Idempotency-Key': 'sale-123'},
  });
  assert.equal(result.status, 200);
  const writes = client.calls.filter(call => !call.url.endsWith('refresh-token'));
  assert.equal(writes.length, 2);
  assert(writes.every(call => call.body === body && call.headers.get('Idempotency-Key') === 'sale-123'));
  assert.equal(writes[1].headers.get('token'), fresh);
});

test('does not loop when retry also returns 401', async () => {
  const client = setup(url => url.endsWith('refresh-token')
    ? reply({Token: token(1, 7200), RefreshToken: 'refresh-2'}) : reply({}, 401));
  assert.equal((await client.authenticatedFetch('https://ai.example/jobs')).status, 401);
  assert.equal(client.calls.length, 3);
});

test('403 does not refresh or erase the session', async () => {
  const client = setup(() => reply({}, 403));
  assert.equal((await client.authenticatedFetch('https://api.example/api/orders')).status, 403);
  assert.equal(client.calls.length, 1);
  assert(client.read());
});

test('rejected refresh expires session and returns 401, never sends mutation', async () => {
  const client = setup(() => reply({}, 401), {Token: token(1, -10), RefreshToken: 'refresh-1'});
  assert.equal((await client.authenticatedFetch('https://api.example/api/orders', {method: 'POST'})).status, 401);
  assert.equal(client.read(), null);
  assert.equal(client.calls.length, 1);
});

test('refresh network failure preserves session', async () => {
  const initial = {Token: token(1, -10), RefreshToken: 'refresh-1'};
  const client = setup(() => {throw new TypeError('offline');}, initial);
  await assert.rejects(client.authenticatedFetch('https://api.example/api/orders'), /offline/);
  assert.deepEqual(client.read(), initial);
});

test('external uploads and similar URL prefixes never receive session tokens', async () => {
  const client = setup(() => reply());
  for (const url of ['https://api.cloudinary.com/upload', 'https://api.example.evil/api/orders', 'https://api.example/api-other/orders']) {
    await client.authenticatedFetch(url, {method:'POST', body:'image'});
  }
  assert(client.calls.every(call => !call.headers.has('Authorization') && !call.headers.has('token')));
});

test('login and recovery never borrow or refresh a stored session', async () => {
  const client = setup(() => reply(), {Token: token(1, -10), RefreshToken: 'refresh-1'});
  await client.authenticatedFetch('https://api.example/api/login', {method: 'POST', body: '{}'});
  assert.equal(client.calls.length, 1);
  assert.equal(client.calls[0].headers.get('token'), null);
});

test('refresh response cannot restore session after logout or overwrite another account', async () => {
  let release;
  const client = setup(async () => {
    await new Promise(resolve => { release = resolve; });
    return reply({Token: token(1, 7200), RefreshToken: 'refresh-2'});
  }, {Token: token(1, -10), RefreshToken: 'refresh-1'});
  const pending = client.authenticatedFetch('https://api.example/api/orders');
  while (!release) await new Promise(resolve => setImmediate(resolve));
  const other = {Token: token(2), RefreshToken: 'other-session'};
  client.set(other);
  release();
  assert.equal((await pending).status, 401);
  assert.deepEqual(client.read(), other);
  assert.equal(client.calls.length, 1);
});

test('stale explicit token for same account uses latest stored access token', async () => {
  const client = setup(() => reply());
  await client.authenticatedFetch('https://api.example/api/orders', {
    headers: {token: token(1, -100), Authorization: `Bearer ${token(1, -100)}`},
  });
  assert.equal(client.calls[0].headers.get('token'), client.read().Token);
  assert.equal(client.calls[0].headers.get('Authorization'), `Bearer ${client.read().Token}`);
});

test('explicit token for another account is never replaced with active user', async () => {
  const client = setup(() => reply());
  const other = token(2);
  await client.authenticatedFetch('https://api.example/api/orders', {headers: {token: other}});
  assert.equal(client.calls[0].headers.get('token'), other);
  assert.equal(client.calls[0].headers.get('Authorization'), null);
});

test('updating a business authenticates, while creating one remains public', async () => {
  const client = setup(() => reply());
  await client.authenticatedFetch('https://api.example/api/business/7', {method: 'PUT', body: '{}'});
  await client.authenticatedFetch('https://api.example/api/business', {method: 'POST', body: '{}'});
  assert.equal(client.calls[0].headers.get('token'), client.read().Token);
  assert.equal(client.calls[1].headers.get('token'), null);
});

test('never conceals conflicting token and Authorization identities', async () => {
  const client = setup(() => reply({}, 401));
  const legacy = client.read().Token, bearer = `Bearer ${token(2)}`;
  assert.equal((await client.authenticatedFetch('https://api.example/api/orders', {
    headers: {token: legacy, Authorization: bearer},
  })).status, 401);
  assert.equal(client.calls.length, 1);
  assert.equal(client.calls[0].headers.get('token'), legacy);
  assert.equal(client.calls[0].headers.get('Authorization'), bearer);
});
