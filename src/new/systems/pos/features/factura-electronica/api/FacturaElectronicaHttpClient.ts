import { getFacturaElectronicaEnvHelp } from "../config/facturaElectronicaEnv";
import { InvoiceFileDownload } from "../model/facturaElectronica.types";

type RequestBody = Record<string, unknown> | FormData | undefined;

type HttpRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: RequestBody;
  query?: Record<string, string | number | boolean | undefined>;
};

export class FacturaElectronicaHttpError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly payload?: unknown,
  ) {
    super(message);
    this.name = "FacturaElectronicaHttpError";
  }
}

export class FacturaElectronicaHttpClient {
  constructor(private readonly baseUrl: string) {}

  private assertConfigured(): void {
    if (!this.baseUrl) {
      throw new FacturaElectronicaHttpError(getFacturaElectronicaEnvHelp());
    }
  }

  private buildUrl(path: string, query?: HttpRequestOptions["query"]): URL {
    this.assertConfigured();
    const url = new URL(path, `${this.baseUrl}/`);

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) url.searchParams.set(key, String(value));
      });
    }

    return url;
  }

  private async parseError(response: Response): Promise<FacturaElectronicaHttpError> {
    const payload = await response.json().catch(() => null);
    const message =
      (payload as { message?: string; error?: string } | null)?.message ||
      (payload as { message?: string; error?: string } | null)?.error ||
      `No fue posible completar la solicitud de Facturación Electrónica (${response.status}).`;

    return new FacturaElectronicaHttpError(message, response.status, payload);
  }

  async request<TResponse>(path: string, options: HttpRequestOptions = {}): Promise<TResponse> {
    const url = this.buildUrl(path, options.query);
    const isFormData = options.body instanceof FormData;

    const response = await fetch(url.toString(), {
      method: options.method ?? "GET",
      headers: isFormData ? undefined : { "Content-Type": "application/json" },
      body: options.body ? (isFormData ? options.body : JSON.stringify(options.body)) : null,
    });

    if (!response.ok) throw await this.parseError(response);

    return (await response.json().catch(() => null)) as TResponse;
  }

  async download(path: string, filename: string): Promise<InvoiceFileDownload> {
    const url = this.buildUrl(path);
    const response = await fetch(url.toString(), { method: "GET" });

    if (!response.ok) throw await this.parseError(response);

    const contentType = response.headers.get("Content-Type") ?? "application/octet-stream";
    const disposition = response.headers.get("Content-Disposition") ?? "";
    const filenameMatch = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
    const resolvedFilename = filenameMatch?.[1] ? decodeURIComponent(filenameMatch[1]) : filename;

    return {
      blob: await response.blob(),
      filename: resolvedFilename,
      contentType,
    };
  }
}
