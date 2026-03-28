const trimTrailingSlash = (value: string): string => {
  if (!value) return "";
  return value.endsWith("/") ? value : `${value}/`;
};

export const getPosApiBaseUrl = (): string => {
  const envUrl = trimTrailingSlash(((import.meta.env as Record<string, string | undefined>).VITE_API_URL as string | undefined) ?? "");

  if (!envUrl) {
    throw new Error("Configura VITE_API_URL en el .env para usar los módulos modernos de POS.");
  }

  return `${envUrl}api/`;
};
