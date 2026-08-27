export type CatalogProductChatStatus =
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED";

export type CatalogProductChatState =
  | "WAITING_FIRST_IMAGE"
  | "COLLECTING_DETAILS"
  | "WAITING_MORE_IMAGES"
  | "READY_TO_CONFIRM"
  | "PUBLISHING"
  | "COMPLETED"
  | "CANCELLED";

export type CatalogProductDraft = {
  name: string | null;
  description: string | null;
  price: number | null;
  stock: number | null;
  wholesaleEnabled: boolean | null;
  wholesalePrice: number | null;
  wholesaleMinQuantity: number | null;
  showPrice: boolean;
};

export type CatalogProductChatSession = {
  sessionId: string;
  status: CatalogProductChatStatus;
  state: CatalogProductChatState;
  productId: number | null;
  draft: CatalogProductDraft;
  imageCount: number;
  missingFields: string[];
  canConfirm: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
};

export type CatalogProductChatMessage = {
  messageId: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  type: "TEXT" | "IMAGE" | "ACTION";
  text: string | null;
  intent: string | null;
  createdAt: string;
};

export type CatalogProductChatResponse = {
  session: CatalogProductChatSession;
  assistantMessage: CatalogProductChatMessage;
  replayed?: boolean;
};

export type CatalogProductChatUpload = {
  clientAssetId: string;
  file: File;
};

export type UploadedCatalogProductImage = {
  clientAssetId: string;
  secureUrl: string;
};

export type CatalogProductChatUploadResult = CatalogProductChatResponse & {
  maxImages: number;
  uploadedImages: UploadedCatalogProductImage[];
};

type SignedUpload = {
  clientAssetId: string;
  publicId: string;
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  uploadUrl: string;
};

type CloudinaryUploadResult = {
  asset_id: string;
  public_id: string;
  version: number;
  signature: string;
  secure_url: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
};

export class CatalogProductChatApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly payload?: unknown,
  ) {
    super(message);
    this.name = "CatalogProductChatApiError";
  }
}

const CLOUDINARY_UPLOAD_TIMEOUT_MS = 90_000;
const CLOUDINARY_UPLOAD_ATTEMPTS = 3;
const CLOUDINARY_RETRYABLE_STATUSES = new Set([
  408,
  425,
  429,
  500,
  502,
  503,
  504,
]);

const ERROR_MESSAGES: Record<string, string> = {
  AUTH_REQUIRED: "Debes iniciar sesión para continuar.",
  INVALID_TOKEN: "Tu sesión dejó de ser válida. Inicia sesión nuevamente.",
  TOKEN_EXPIRED: "Tu sesión expiró. Inicia sesión nuevamente.",
  INVALID_AUTH_PRINCIPAL: "No fue posible identificar tu negocio.",
  SESSION_NOT_FOUND: "No encontramos esta conversación.",
  SESSION_EXPIRED: "La conversación expiró. Inicia una nueva.",
  SESSION_NOT_ACTIVE: "Esta conversación ya terminó.",
  IMAGE_LIMIT_EXCEEDED: "Alcanzaste el límite de imágenes del producto.",
  INVALID_IMAGE_TYPE: "El formato de una imagen no es compatible.",
  FILE_TOO_LARGE: "Una imagen supera el tamaño permitido.",
  DRAFT_INCOMPLETE: "Aún faltan datos antes de crear el producto.",
  AI_UNAVAILABLE: "El asistente no está disponible por el momento.",
};

const sleep = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

const normalizeBaseUrl = (value: string): string => {
  const normalized = value
    .trim()
    .replace(/^['"]+|['"]+$/g, "")
    .replace(/\/+$/, "");

  if (/^https?:\/\//i.test(normalized)) return normalized;
  if (
    normalized.startsWith("localhost") ||
    normalized.startsWith("127.0.0.1")
  ) {
    return `http://${normalized}`;
  }
  return `https://${normalized}`;
};

const normalizeAccessToken = (value: string): string =>
  value
    .trim()
    .replace(/^['"]+|['"]+$/g, "")
    .replace(/^Bearer\s+/i, "")
    .trim();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));

const errorCodeFromPayload = (payload: unknown): string | undefined => {
  if (!isRecord(payload)) return undefined;
  return typeof payload.error === "string" && payload.error.trim()
    ? payload.error.trim()
    : undefined;
};

const errorMessageFromPayload = (
  payload: unknown,
  fallback: string,
): string => {
  const code = errorCodeFromPayload(payload);
  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  if (!isRecord(payload)) return fallback;
  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message.trim();
  }
  return fallback;
};

const isCloudinaryUploadResult = (
  value: unknown,
): value is CloudinaryUploadResult => {
  if (!isRecord(value)) return false;
  return (
    typeof value.asset_id === "string" &&
    Boolean(value.asset_id) &&
    typeof value.public_id === "string" &&
    Boolean(value.public_id) &&
    Number.isInteger(Number(value.version)) &&
    Number(value.version) > 0 &&
    typeof value.signature === "string" &&
    Boolean(value.signature) &&
    typeof value.secure_url === "string" &&
    /^https:\/\//i.test(value.secure_url) &&
    Number.isInteger(Number(value.width)) &&
    Number(value.width) > 0 &&
    Number.isInteger(Number(value.height)) &&
    Number(value.height) > 0 &&
    Number.isInteger(Number(value.bytes)) &&
    Number(value.bytes) > 0 &&
    typeof value.format === "string" &&
    Boolean(value.format)
  );
};

export const isCatalogProductChatAuthError = (
  cause: unknown,
): cause is CatalogProductChatApiError =>
  cause instanceof CatalogProductChatApiError && cause.status === 401;

export const isCatalogProductChatGoneError = (
  cause: unknown,
): cause is CatalogProductChatApiError =>
  cause instanceof CatalogProductChatApiError &&
  (cause.status === 404 || cause.status === 410);

export class CatalogProductChatApi {
  private readonly baseUrl: string;
  private readonly token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = normalizeBaseUrl(baseUrl);
    this.token = normalizeAccessToken(token);
  }

  createSession(
    clientRequestId = `web-chat-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  ): Promise<CatalogProductChatResponse> {
    return this.request("/v1/catalog-product-chats", {
      method: "POST",
      body: JSON.stringify({ clientRequestId }),
    });
  }

  getSession(
    sessionId: string,
  ): Promise<{ session: CatalogProductChatSession }> {
    return this.request(
      `/v1/catalog-product-chats/${encodeURIComponent(sessionId)}`,
    );
  }

  listMessages(
    sessionId: string,
    limit = 100,
  ): Promise<{ messages: CatalogProductChatMessage[] }> {
    const query = new URLSearchParams({ limit: String(limit) });
    return this.request(
      `/v1/catalog-product-chats/${encodeURIComponent(sessionId)}/messages?${query.toString()}`,
    );
  }

  sendMessage(
    sessionId: string,
    text: string,
    clientMessageId = `web-message-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  ): Promise<CatalogProductChatResponse> {
    return this.request(
      `/v1/catalog-product-chats/${encodeURIComponent(sessionId)}/messages`,
      {
        method: "POST",
        body: JSON.stringify({ clientMessageId, text }),
      },
    );
  }

  confirm(sessionId: string): Promise<CatalogProductChatResponse> {
    return this.request(
      `/v1/catalog-product-chats/${encodeURIComponent(sessionId)}/confirm`,
      { method: "POST" },
    );
  }

  cancel(sessionId: string): Promise<CatalogProductChatResponse> {
    return this.request(
      `/v1/catalog-product-chats/${encodeURIComponent(sessionId)}/cancel`,
      { method: "POST" },
    );
  }

  async uploadImages(
    sessionId: string,
    images: CatalogProductChatUpload[],
    onProgress?: (uploaded: number, total: number) => void,
  ): Promise<CatalogProductChatUploadResult> {
    if (images.length === 0) {
      throw new CatalogProductChatApiError(
        "Selecciona al menos una imagen.",
        400,
        "EMPTY_UPLOAD",
      );
    }

    const signedResponse = await this.request<{
      uploads: SignedUpload[];
      maxImages: number;
    }>(
      `/v1/catalog-product-chats/${encodeURIComponent(sessionId)}/uploads/sign`,
      {
        method: "POST",
        body: JSON.stringify({
          files: images.map(({ clientAssetId, file }) => ({
            clientAssetId,
            mimeType: file.type,
          })),
        }),
      },
    );

    const uploaded: Array<{
      local: CatalogProductChatUpload;
      cloudinary: CloudinaryUploadResult;
    }> = [];

    for (const image of images) {
      const reservation = signedResponse.uploads.find(
        ({ clientAssetId }) => clientAssetId === image.clientAssetId,
      );
      if (!reservation) {
        throw new CatalogProductChatApiError(
          `No se reservó la carga de ${image.file.name}.`,
          502,
          "UPLOAD_RESERVATION_NOT_FOUND",
        );
      }
      const cloudinary = await this.uploadToCloudinary(image.file, reservation);
      uploaded.push({ local: image, cloudinary });
      onProgress?.(uploaded.length, images.length);
    }

    const response = await this.request<CatalogProductChatResponse>(
      `/v1/catalog-product-chats/${encodeURIComponent(sessionId)}/assets`,
      {
        method: "POST",
        body: JSON.stringify({
          assets: uploaded.map(({ local, cloudinary }) => ({
            clientAssetId: local.clientAssetId,
            assetId: cloudinary.asset_id,
            publicId: cloudinary.public_id,
            version: cloudinary.version,
            signature: cloudinary.signature,
            width: cloudinary.width,
            height: cloudinary.height,
            bytes: cloudinary.bytes,
            format: cloudinary.format,
            mimeType: local.file.type,
          })),
        }),
      },
    );

    return {
      ...response,
      maxImages: signedResponse.maxImages,
      uploadedImages: uploaded.map(({ local, cloudinary }) => ({
        clientAssetId: local.clientAssetId,
        secureUrl: cloudinary.secure_url,
      })),
    };
  }

  private async uploadToCloudinary(
    file: File,
    signed: SignedUpload,
  ): Promise<CloudinaryUploadResult> {
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= CLOUDINARY_UPLOAD_ATTEMPTS; attempt += 1) {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(
        () => controller.abort(),
        CLOUDINARY_UPLOAD_TIMEOUT_MS,
      );

      try {
        const formData = new FormData();
        formData.append("file", file, file.name);
        formData.append("api_key", signed.apiKey);
        formData.append("timestamp", String(signed.timestamp));
        formData.append("signature", signed.signature);
        formData.append("public_id", signed.publicId);

        const response = await fetch(signed.uploadUrl, {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          const uploadError = new CatalogProductChatApiError(
            errorMessageFromPayload(
              payload,
              `No se pudo subir ${file.name} a Cloudinary.`,
            ),
            response.status,
            errorCodeFromPayload(payload),
            payload,
          );
          if (
            attempt < CLOUDINARY_UPLOAD_ATTEMPTS &&
            CLOUDINARY_RETRYABLE_STATUSES.has(response.status)
          ) {
            lastError = uploadError;
            await sleep(700 * attempt + Math.floor(Math.random() * 300));
            continue;
          }
          throw uploadError;
        }

        if (!isCloudinaryUploadResult(payload)) {
          throw new CatalogProductChatApiError(
            "Cloudinary no devolvió la información completa de la imagen.",
            502,
            "INVALID_CLOUDINARY_RESPONSE",
            payload,
          );
        }
        return payload;
      } catch (cause) {
        lastError = cause;
        const isAbort =
          cause instanceof DOMException && cause.name === "AbortError";
        const retryable =
          isAbort ||
          cause instanceof TypeError ||
          (cause instanceof CatalogProductChatApiError &&
            CLOUDINARY_RETRYABLE_STATUSES.has(cause.status));

        if (attempt < CLOUDINARY_UPLOAD_ATTEMPTS && retryable) {
          await sleep(700 * attempt + Math.floor(Math.random() * 300));
          continue;
        }
        if (isAbort) {
          throw new CatalogProductChatApiError(
            `La subida de ${file.name} tardó demasiado. Intenta nuevamente.`,
            408,
            "CLOUDINARY_UPLOAD_TIMEOUT",
            cause,
          );
        }
        throw cause;
      } finally {
        window.clearTimeout(timeoutId);
      }
    }

    throw new CatalogProductChatApiError(
      `No se pudo subir ${file.name}.`,
      503,
      "CLOUDINARY_UPLOAD_RETRIES_EXHAUSTED",
      lastError,
    );
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    if (!this.token) {
      throw new CatalogProductChatApiError(
        "Debes iniciar sesión para continuar.",
        401,
        "AUTH_REQUIRED",
      );
    }

    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");
    headers.set("Authorization", `Bearer ${this.token}`);
    headers.set("Cache-Control", "no-cache, no-store, max-age=0");
    headers.set("Pragma", "no-cache");
    if (init.body && !(init.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        headers,
        cache: "no-store",
      });
    } catch (cause) {
      throw new CatalogProductChatApiError(
        "No se pudo conectar con el asistente de productos. Verifica que el microservicio esté encendido y que CORS permita este frontend.",
        0,
        "NETWORK_ERROR",
        cause,
      );
    }

    const responseText = await response.text().catch(() => "");
    let payload: unknown = null;
    if (responseText) {
      try {
        payload = JSON.parse(responseText);
      } catch {
        payload = responseText;
      }
    }

    if (!response.ok) {
      throw new CatalogProductChatApiError(
        errorMessageFromPayload(payload, `Error HTTP ${response.status}`),
        response.status,
        errorCodeFromPayload(payload),
        payload,
      );
    }

    return payload as T;
  }
}
