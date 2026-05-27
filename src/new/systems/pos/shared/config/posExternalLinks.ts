const readEnv = (key: string): string => ((import.meta.env as Record<string, string | undefined>)[key] ?? "").trim();

const withFallback = (value: string, fallback: string): string => (value.length > 0 ? value : fallback);

export const POS_SUPPORT_WHATSAPP_URL = withFallback(readEnv("VITE_POS_SUPPORT_WHATSAPP_URL"), "");
export const POS_PUBLIC_CATALOG_BASE_URL = withFallback(readEnv("VITE_POS_CATALOG_BASE_URL"), "");
export const POS_CLOUDINARY_UPLOAD_URL = withFallback(readEnv("VITE_POS_CLOUDINARY_UPLOAD_URL"), "");

export const buildPosPublicCatalogUrl = (businessId: number): string => {
  if (!Number.isFinite(businessId) || businessId <= 0) return POS_PUBLIC_CATALOG_BASE_URL;
  return `${POS_PUBLIC_CATALOG_BASE_URL.replace(/\/$/, "")}/${businessId}`;
};
