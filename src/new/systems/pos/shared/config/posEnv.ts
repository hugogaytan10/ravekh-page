const trimTrailingSlash = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
};

export const getPosApiBaseUrl = (): string => {
  const envUrl = trimTrailingSlash(((import.meta.env as Record<string, string | undefined>).VITE_APP_URL as string | undefined) ?? "");

  if (!envUrl) {
    throw new Error("Configura VITE_API_URL en el .env para usar POS v2.");
  }

  return envUrl;
};
