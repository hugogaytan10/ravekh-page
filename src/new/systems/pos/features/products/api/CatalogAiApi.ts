export type CatalogAiItemStatus =
  | "SIGNED"
  | "UPLOADED"
  | "QUEUED"
  | "ANALYZING"
  | "READY"
  | "PUBLISHING"
  | "PUBLISHED"
  | "REVIEW_REQUIRED"
  | "DUPLICATE_EXACT"
  | "REJECTED_NOT_PRODUCT"
  | "FAILED_RETRYABLE"
  | "FAILED_PERMANENT"
  | "DISCARDED";

export type CatalogAiBatchStatus =
  | "CREATED"
  | "UPLOADING"
  | "QUEUED"
  | "PROCESSING"
  | "COMPLETED"
  | "COMPLETED_WITH_ERRORS"
  | "CANCELLED";

export type CatalogAiBatchProgress = {
  batchId: string;
  status: CatalogAiBatchStatus;
  autoPublish: boolean;
  total: number;
  uploaded: number;
  processed: number;
  published: number;
  duplicates: number;
  review: number;
  failed: number;
};

export type CatalogAiItem = {
  Id: number;
  Client_Asset_Id: string;
  Status: CatalogAiItemStatus;
  Sort_Order: number;
  Secure_Url: string | null;
  Suggested_Name: string | null;
  Suggested_Description: string | null;
  Suggested_Category: string | null;
  Suggested_Subcategory: string | null;
  Suggested_Brand: string | null;
  Suggested_Color: string | null;
  Suggested_Price: number | string | null;
  Suggested_Stock: number | string | null;
  For_Sale: number | boolean;
  Confidence: number | string | null;
  Duplicate_Reason: string | null;
  Duplicate_Product_Id: number | null;
  Product_Id: number | null;
  Error_Code: string | null;
  Error_Message: string | null;
  Retry_Count: number;
  Queue_Available_At: string | null;
  Updated_At: string;
};

export type CatalogAiItemPatch = {
  name?: string;
  description?: string | null;
  category?: string | null;
  subcategory?: string | null;
  brand?: string | null;
  color?: string | null;
  price?: number | null;
  stock?: number;
};

export type SignedCatalogUpload = {
  clientAssetId: string;
  publicId: string;
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  uploadUrl: string;
  folder: string;
  transformation: string;
};

export type CloudinaryUploadResult = {
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

export type RegisteredCatalogAsset = {
  clientAssetId: string;
  assetId: string;
  publicId: string;
  version: number;
  signature: string;
  secureUrl: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
  mimeType: string;
};

export class CatalogAiApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly payload?: unknown,
  ) {
    super(message);
    this.name = "CatalogAiApiError";
  }
}

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const normalizeAccessToken = (value: string): string =>
  value
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .replace(/^Bearer\s+/i, "")
    .trim();

const errorCodeFromPayload = (payload: unknown): string | undefined => {
  if (!payload || typeof payload !== "object") return undefined;
  const record = payload as Record<string, unknown>;
  return typeof record.error === "string" && record.error.trim()
    ? record.error.trim()
    : undefined;
};

export const isCatalogAiSessionExpiredError = (
  cause: unknown,
): cause is CatalogAiApiError => {
  if (!(cause instanceof CatalogAiApiError) || cause.status !== 401) {
    return false;
  }

  if (cause.code === "TOKEN_EXPIRED") return true;

  if (cause.payload && typeof cause.payload === "object") {
    const detail = (cause.payload as Record<string, unknown>).detail;
    return typeof detail === "string" && /jwt expired/i.test(detail);
  }

  return false;
};

const errorMessageFromPayload = (payload: unknown, fallback: string): string => {
  if (!payload || typeof payload !== "object") return fallback;
  const record = payload as Record<string, unknown>;
  const error = record.error;
  if (typeof error === "string" && error.trim()) return error;
  if (error && typeof error === "object") {
    const nestedMessage = (error as Record<string, unknown>).message;
    if (typeof nestedMessage === "string" && nestedMessage.trim()) return nestedMessage;
  }
  const message = record.message;
  if (typeof message === "string" && message.trim()) return message;
  return fallback;
};

export class CatalogAiApi {
  private readonly baseUrl: string;
  private readonly token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = trimTrailingSlash(baseUrl);
    this.token = normalizeAccessToken(token);
  }

  private async request<T>(
    path: string,
    init: RequestInit = {},
  ): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");
    headers.set("Authorization", `Bearer ${this.token}`);

    if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers,
    });

    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? await response.json().catch(() => null)
      : await response.text().catch(() => "");

    if (!response.ok) {
      throw new CatalogAiApiError(
        errorMessageFromPayload(payload, `Error HTTP ${response.status}`),
        response.status,
        errorCodeFromPayload(payload),
        payload,
      );
    }

    return payload as T;
  }

  async createBatch(expectedItems: number): Promise<{ batchId: string; status: string; maxImages: number }> {
    return this.request("/v1/catalog-imports", {
      method: "POST",
      body: JSON.stringify({
        expectedItems,
        autoPublish: false,
        clientRequestId: `web-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      }),
    });
  }

  async signUploads(
    batchId: string,
    files: Array<{ clientAssetId: string; mimeType: string }>,
  ): Promise<SignedCatalogUpload[]> {
    const response = await this.request<{ uploads: SignedCatalogUpload[] }>(
      `/v1/catalog-imports/${encodeURIComponent(batchId)}/uploads/sign`,
      {
        method: "POST",
        body: JSON.stringify({ files }),
      },
    );
    return response.uploads;
  }

  async uploadToCloudinary(
    file: File,
    signed: SignedCatalogUpload,
  ): Promise<CloudinaryUploadResult> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signed.apiKey);
    formData.append("timestamp", String(signed.timestamp));
    formData.append("signature", signed.signature);
    formData.append("public_id", signed.publicId);
    formData.append("transformation", signed.transformation);

    const response = await fetch(signed.uploadUrl, {
      method: "POST",
      body: formData,
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new CatalogAiApiError(
        errorMessageFromPayload(payload, "No se pudo subir la imagen a Cloudinary."),
        response.status,
        errorCodeFromPayload(payload),
        payload,
      );
    }

    return payload as CloudinaryUploadResult;
  }

  async registerAssets(batchId: string, assets: RegisteredCatalogAsset[]): Promise<void> {
    await this.request(
      `/v1/catalog-imports/${encodeURIComponent(batchId)}/assets`,
      {
        method: "POST",
        body: JSON.stringify({ assets }),
      },
    );
  }

  async startBatch(batchId: string): Promise<void> {
    await this.request(
      `/v1/catalog-imports/${encodeURIComponent(batchId)}/start`,
      { method: "POST" },
    );
  }

  async getBatch(batchId: string): Promise<CatalogAiBatchProgress> {
    return this.request(
      `/v1/catalog-imports/${encodeURIComponent(batchId)}`,
    );
  }

  async listBatchItems(batchId: string): Promise<CatalogAiItem[]> {
    const allItems: CatalogAiItem[] = [];
    let afterId: number | null = null;

    do {
      const query = new URLSearchParams({ limit: "100" });
      if (afterId) query.set("afterId", String(afterId));
      const response = await this.request<{
        items: CatalogAiItem[];
        nextAfterId: number | null;
      }>(
        `/v1/catalog-imports/${encodeURIComponent(batchId)}/items?${query.toString()}`,
      );
      allItems.push(...response.items);
      afterId = response.nextAfterId;
    } while (afterId);

    return allItems;
  }

  async updateItem(batchId: string, itemId: number, patch: CatalogAiItemPatch): Promise<void> {
    await this.request(
      `/v1/catalog-imports/${encodeURIComponent(batchId)}/items/${itemId}`,
      {
        method: "PATCH",
        body: JSON.stringify(patch),
      },
    );
  }

  async publishItem(
    batchId: string,
    item: CatalogAiItem,
    options: { showPrice: boolean },
  ): Promise<number> {
    if (item.Status === "DUPLICATE_EXACT") {
      const response = await this.request<{ productId: number }>(
        `/v1/catalog-imports/${encodeURIComponent(batchId)}/items/${item.Id}/resolve-duplicate`,
        {
          method: "POST",
          body: JSON.stringify({ action: "publish", showPrice: options.showPrice }),
        },
      );
      return response.productId;
    }

    const response = await this.request<{ productId: number }>(
      `/v1/catalog-imports/${encodeURIComponent(batchId)}/items/${item.Id}/publish`,
      {
        method: "POST",
        body: JSON.stringify({ showPrice: options.showPrice }),
      },
    );
    return response.productId;
  }

  async retryItem(batchId: string, itemId: number): Promise<void> {
    await this.request(
      `/v1/catalog-imports/${encodeURIComponent(batchId)}/items/${itemId}/retry`,
      { method: "POST" },
    );
  }
}
