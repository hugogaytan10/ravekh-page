const readEnv = (key: string): string =>
  ((import.meta.env as Record<string, string | undefined>)[key] ?? "").trim();

const withFallback = (value: string, fallback: string): string =>
  value.length > 0 ? value : fallback;

export const POS_SUPPORT_WHATSAPP_URL = withFallback(
  readEnv("VITE_POS_SUPPORT_WHATSAPP_URL"),
  "",
);

export const POS_PUBLIC_CATALOG_BASE_URL = withFallback(
  readEnv("VITE_POS_CATALOG_BASE_URL"),
  "",
);

export const POS_CLOUDINARY_UPLOAD_URL = withFallback(
  readEnv("VITE_POS_CLOUDINARY_UPLOAD_URL"),
  "",
);

const resolveCatalogBaseUrl = (): string => {
  const configured = POS_PUBLIC_CATALOG_BASE_URL.replace(/\/$/, "");

  if (!configured) {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/v2/catalogo`;
    }

    return "/v2/catalogo";
  }

  // Canonicalizamos la ruta vieja /catalogo a la ruta moderna /v2/catalogo.
  // Se conserva host/dominio configurado.
  if (
    /\/catalogo$/i.test(configured) &&
    !/\/v2\/catalogo$/i.test(configured)
  ) {
    return configured.replace(/\/catalogo$/i, "/v2/catalogo");
  }

  return configured;
};

export const buildPosPublicCatalogUrl = (
  businessId: number,
  branchSlug?: string | null,
): string => {
  const baseUrl = resolveCatalogBaseUrl();

  if (!Number.isFinite(businessId) || businessId <= 0) {
    return baseUrl;
  }

  const normalizedSlug = String(branchSlug ?? "").trim();
  const businessUrl = `${baseUrl}/${businessId}`;

  return normalizedSlug
    ? `${businessUrl}/${encodeURIComponent(normalizedSlug)}`
    : businessUrl;
};
