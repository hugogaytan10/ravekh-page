const DEFAULT_WEB_COUPONS_DOMAIN = "https://ravekh.com";

const ensureTrailingSlash = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
};

const readEnv = (key: string): string =>
  (((import.meta.env as Record<string, string | undefined>)[key] as string | undefined) ?? "").trim();

const resolveApiBaseUrl = (): string => ensureTrailingSlash(readEnv("VITE_API_URL"));

const resolveWebCouponsDomain = (): string => readEnv("VITE_WEB_COUPONS_DOMAIN") || DEFAULT_WEB_COUPONS_DOMAIN;

export const COUPONS_API_URL = resolveApiBaseUrl();
export const WEB_COUPONS_DOMAIN = resolveWebCouponsDomain();
