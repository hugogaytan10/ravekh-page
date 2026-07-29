export interface CatalogImportProgress {
  batchId: string;
  status: string;
  total: number;
  uploaded: number;
  processed: number;
  published: number;
  duplicates: number;
  review: number;
  failed: number;
}

export interface LocalImageAsset {
  id: string;
  uri: string;
  mimeType: string;
  fileName?: string;
}

export interface CloudinaryUploadResult {
  asset_id: string;
  public_id: string;
  version: number;
  signature: string;
  secure_url: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
}

export class CatalogAiApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly payload?: unknown,
  ) {
    super(message);
    this.name = 'CatalogAiApiError';
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object';

const chunk = <T>(values: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    result.push(values.slice(index, index + size));
  }
  return result;
};

export class CatalogAiApi {
  constructor(private readonly baseUrl: string, private readonly getToken: () => Promise<string>) {}

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = await this.getToken();
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...init.headers,
      },
    });

    const contentType = response.headers.get('content-type') ?? '';
    const data: unknown = contentType.includes('application/json')
      ? await response.json().catch(() => null)
      : await response.text().catch(() => '');

    if (!response.ok) {
      const code = isRecord(data) && typeof data.error === 'string'
        ? data.error
        : `HTTP_${response.status}`;
      const message = isRecord(data) && typeof data.message === 'string'
        ? data.message
        : code;

      throw new CatalogAiApiError(message, response.status, code, data);
    }

    return data as T;
  }

  createBatch(expectedItems: number) {
    return this.request<{ batchId: string; maxImages: number }>('/v1/catalog-imports', {
      method: 'POST',
      body: JSON.stringify({ expectedItems, autoPublish: true, clientRequestId: `${Date.now()}` }),
    });
  }

  async signUploads(batchId: string, assets: LocalImageAsset[]) {
    return this.request<{ uploads: Array<any> }>(`/v1/catalog-imports/${batchId}/uploads/sign`, {
      method: 'POST',
      body: JSON.stringify({ files: assets.map((asset) => ({ clientAssetId: asset.id, mimeType: asset.mimeType })) }),
    });
  }

  async uploadToCloudinary(
    asset: LocalImageAsset,
    signed: any,
  ): Promise<CloudinaryUploadResult> {
    const form = new FormData();
    form.append(
      'file',
      {
        uri: asset.uri,
        type: asset.mimeType,
        name: asset.fileName ?? `${asset.id}.jpg`,
      } as any,
    );
    form.append('api_key', signed.apiKey);
    form.append('timestamp', String(signed.timestamp));
    form.append('signature', signed.signature);
    form.append('public_id', signed.publicId);

    // No se envía transformation, eager, quality ni fetch_format.
    const response = await fetch(signed.uploadUrl, { method: 'POST', body: form });
    const result: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        isRecord(result) &&
        isRecord(result.error) &&
        typeof result.error.message === 'string'
          ? result.error.message
          : 'CLOUDINARY_UPLOAD_FAILED';
      throw new CatalogAiApiError(message, response.status, 'CLOUDINARY_UPLOAD_FAILED', result);
    }

    if (
      !isRecord(result) ||
      typeof result.asset_id !== 'string' ||
      typeof result.public_id !== 'string' ||
      typeof result.version !== 'number' ||
      typeof result.signature !== 'string' ||
      typeof result.secure_url !== 'string' ||
      !result.secure_url.startsWith('https://') ||
      typeof result.width !== 'number' ||
      typeof result.height !== 'number' ||
      typeof result.bytes !== 'number' ||
      typeof result.format !== 'string'
    ) {
      throw new CatalogAiApiError(
        'Cloudinary devolvió información incompleta para la imagen.',
        502,
        'INVALID_CLOUDINARY_RESPONSE',
        result,
      );
    }

    return result as unknown as CloudinaryUploadResult;
  }

  async registerAssets(
    batchId: string,
    assets: Array<{ local: LocalImageAsset; cloudinary: CloudinaryUploadResult }>,
  ): Promise<void> {
    // Registrar grupos pequeños evita que una carga grande dependa de una sola
    // petición y facilita identificar el archivo que falló.
    for (const group of chunk(assets, 10)) {
      await this.request(`/v1/catalog-imports/${batchId}/assets`, {
        method: 'POST',
        body: JSON.stringify({
          assets: group.map(({ local, cloudinary }) => ({
            clientAssetId: local.id,
            assetId: cloudinary.asset_id,
            publicId: cloudinary.public_id,
            version: cloudinary.version,
            signature: cloudinary.signature,
            secureUrl: cloudinary.secure_url,
            width: cloudinary.width,
            height: cloudinary.height,
            bytes: cloudinary.bytes,
            format: cloudinary.format,
            mimeType: local.mimeType,
          })),
        }),
      });
    }
  }

  start(batchId: string) {
    return this.request(`/v1/catalog-imports/${batchId}/start`, { method: 'POST' });
  }

  progress(batchId: string) {
    return this.request<CatalogImportProgress>(`/v1/catalog-imports/${batchId}`);
  }

  items(batchId: string, afterId?: number) {
    const query = afterId ? `?afterId=${afterId}` : '';
    return this.request<{ items: any[]; nextAfterId: number | null }>(`/v1/catalog-imports/${batchId}/items${query}`);
  }

  editItem(batchId: string, itemId: number, changes: {
    name?: string;
    description?: string | null;
    category?: string | null;
    subcategory?: string | null;
    brand?: string | null;
    color?: string | null;
  }) {
    return this.request(`/v1/catalog-imports/${batchId}/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(changes),
    });
  }

  publishItem(batchId: string, itemId: number) {
    return this.request<{ productId: number }>(`/v1/catalog-imports/${batchId}/items/${itemId}/publish`, {
      method: 'POST',
    });
  }

  resolveDuplicate(
    batchId: string,
    itemId: number,
    resolution: { action: 'publish' | 'discard' } | { action: 'link_existing'; productId: number },
  ) {
    return this.request(`/v1/catalog-imports/${batchId}/items/${itemId}/resolve-duplicate`, {
      method: 'POST',
      body: JSON.stringify(resolution),
    });
  }

  retryItem(batchId: string, itemId: number) {
    return this.request(`/v1/catalog-imports/${batchId}/items/${itemId}/retry`, { method: 'POST' });
  }
}
