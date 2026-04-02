const DEFAULT_API_BASE_URL = "https://apipos.ravekh.com/api/";
const DEFAULT_WEB_COUPONS_DOMAIN = "https://ravekh.com";

const ensureTrailingSlash = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
};

const resolveApiBaseUrl = (): string =>
  ensureTrailingSlash(import.meta.env.VITE_POS_API_URL ?? import.meta.env.VITE_COUPONS_API_URL ?? DEFAULT_API_BASE_URL);

const resolveWebCouponsDomain = (): string =>
  (import.meta.env.VITE_WEB_COUPONS_DOMAIN ?? DEFAULT_WEB_COUPONS_DOMAIN).trim();

export const COUPONS_API_URL = resolveApiBaseUrl();
export const WEB_COUPONS_DOMAIN = resolveWebCouponsDomain();
