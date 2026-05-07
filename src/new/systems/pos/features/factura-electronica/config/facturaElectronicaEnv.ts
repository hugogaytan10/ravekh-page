const trimTrailingSlash = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
};

const readEnv = (key: string): string =>
  (((import.meta.env as Record<string, string | undefined>)[key] as string | undefined) ?? "").trim();

export const FACTURA_ELECTRONICA_ENV_NAME = "FACTURA_ELECTRONICA_API_URL";
export const FACTURA_ELECTRONICA_VITE_FALLBACK_ENV_NAME = "VITE_FACTURA_ELECTRONICA_API_URL";

export const getFacturaElectronicaApiBaseUrl = (): string => {
  const exactEnvUrl = readEnv(FACTURA_ELECTRONICA_ENV_NAME);
  const viteFallbackUrl = readEnv(FACTURA_ELECTRONICA_VITE_FALLBACK_ENV_NAME);
  return trimTrailingSlash(exactEnvUrl || viteFallbackUrl);
};

export const getFacturaElectronicaEnvHelp = (): string =>
  `Configura ${FACTURA_ELECTRONICA_ENV_NAME}. En Vite, las variables expuestas al cliente normalmente requieren prefijo VITE_; si tu build no expone ${FACTURA_ELECTRONICA_ENV_NAME}, agrega también ${FACTURA_ELECTRONICA_VITE_FALLBACK_ENV_NAME} con la misma URL.`;
