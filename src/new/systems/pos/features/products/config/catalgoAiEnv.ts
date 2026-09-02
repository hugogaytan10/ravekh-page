const DEFAULT_CATALOG_AI_URL = "http://localhost:8095";

const normalizeCatalogAiApiUrl = (value: string): string => {
  const normalized = value
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .replace(/\/+$/, "");

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  if (
    normalized.startsWith("localhost") ||
    normalized.startsWith("127.0.0.1")
  ) {
    return `http://${normalized}`;
  }

  return `https://${normalized}`;
};

export const CATALOG_AI_API_URL = normalizeCatalogAiApiUrl(
  String(
    import.meta.env.VITE_CATALOG_AI_API_URL ??
      DEFAULT_CATALOG_AI_URL,
  ),
);
