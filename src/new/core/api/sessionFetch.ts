import {createSessionTransport, sameSession} from './sessionTransport';
import {POS_SESSION_STORAGE_KEYS, clearPosSessionSnapshot} from '../../systems/pos/shared/config/posSession';
import {CATALOG_AI_API_URL} from '../../systems/pos/features/products/config/catalgoAiEnv';

const apiBaseUrl = () => String(import.meta.env.VITE_API_URL ?? '').trim();
const createTransport = (customer: boolean) => {
  const tokenKey = customer ? 'cupones-token' : POS_SESSION_STORAGE_KEYS.token;
  const refreshKey = customer ? 'cupones-refresh-token' : POS_SESSION_STORAGE_KEYS.refreshToken;
  return createSessionTransport({
    apiBaseUrl,
    trustedBases: () => [apiBaseUrl(), CATALOG_AI_API_URL,
      String(import.meta.env.VITE_CATALOG_PRODUCT_CHAT_API_URL ?? 'http://localhost:8092').trim()],
    decodeBase64: value => atob(value),
    store: {
      async read() {
        const Token = localStorage.getItem(tokenKey) ?? '';
        return Token ? {Token, RefreshToken: localStorage.getItem(refreshKey) ?? ''} : null;
      },
      async replace(expected, next) {
        const current = {
          Token: localStorage.getItem(tokenKey) ?? '',
          RefreshToken: localStorage.getItem(refreshKey) ?? '',
        };
        if (!sameSession(current, expected)) return false;
        if (next) {
          localStorage.setItem(tokenKey, next.Token);
          localStorage.setItem(refreshKey, next.RefreshToken ?? '');
        } else if (customer) {
          ['cupones-token', 'cupones-refresh-token', 'cupones-session', 'cupones-user-id',
            'cupones-role', 'cupones-name', 'cupones-business-id'].forEach(key => localStorage.removeItem(key));
        } else {
          clearPosSessionSnapshot();
        }
        window.dispatchEvent(new CustomEvent('ravekh:auth-tokens-updated', {detail: {customer, expired: !next}}));
        return true;
      },
    },
  });
};
const pos = createTransport(false);
const customer = createTransport(true);
export const authenticatedFetch = pos.authenticatedFetch;
export const ensurePosSession = pos.ensureSession;
// Coupon administration may explicitly supply the POS identity on the same page.
export const customerFetch = (input: string, init: RequestInit = {}) => {
  const headers = new Headers(init.headers);
  const token = headers.get('token') || headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  const posToken = localStorage.getItem(POS_SESSION_STORAGE_KEYS.token);
  const customerToken = localStorage.getItem('cupones-token');
  // The transport itself checks token identity before using the selected session.
  return token && token !== customerToken && !!posToken
    ? pos.authenticatedFetch(input, init)
    : customer.authenticatedFetch(input, init);
};
