/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_POS_SUPPORT_WHATSAPP_URL?: string;
  readonly VITE_POS_CATALOG_BASE_URL?: string;
  readonly VITE_POS_CLOUDINARY_UPLOAD_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
