import {authenticatedFetch as fetch} from './sessionFetch';
import { HttpClient, HttpRequest } from "./HttpClient";
import { readActivePosBranchId } from "../../systems/pos/shared/config/posBranch";

export const createIdempotencyKey = (): string =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export class FetchHttpClient implements HttpClient {
  constructor(private readonly baseUrl: string) {}

  async request<TResponse>(request: HttpRequest): Promise<TResponse> {
    const { response, responseData } = await this.execute(request);

    if (!response.ok) {
      this.throwRequestError(response.status, responseData);
    }

    return responseData as TResponse;
  }

  async requestStatus(request: HttpRequest): Promise<number> {
    const { response, responseData } = await this.execute(request);

    if (!response.ok) {
      this.throwRequestError(response.status, responseData);
    }

    return response.status;
  }

  private async execute(request: HttpRequest): Promise<{ response: Response; responseData: unknown }> {
    const url = new URL(request.path, this.baseUrl);

    if (request.query) {
      Object.entries(request.query).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    const isFormData = request.body instanceof FormData;
    const headers: Record<string, string> = isFormData ? {} : { "Content-Type": "application/json" };

    if (request.method === "POST") {
      headers["Idempotency-Key"] = request.idempotencyKey ?? createIdempotencyKey();
    }

    if (request.token) {
      headers.Authorization = `Bearer ${request.token}`;
      headers.token = request.token;

      if (!request.skipBranchHeader) {
        const branchId = request.branchId ?? readActivePosBranchId();
        if (Number.isInteger(branchId) && branchId > 0) {
          headers["X-Branch-Id"] = String(branchId);
          if(/^(?:coupons|couponhasusers)(?:\/|$)/.test(request.path)) headers["X-Coupon-Scope"]="branch-v1";
          if(/^(?:visits|visits\/qr\/(?:generate|dynamic\/next))$/.test(request.path)) headers["X-Visit-Scope"]="branch-v1";
          if(/^(?:categories|products)(?:\/|$)/.test(request.path)) headers['X-Category-Scope']='branch-v1';
        }
      }
    }

    const body: BodyInit | null = request.body
      ? (isFormData ? (request.body as FormData) : JSON.stringify(request.body))
      : null;

    const response = await fetch(url.toString(), {
      method: request.method,
      headers,
      body,
    });

    const responseData = (await response.json().catch(() => null)) as { message?: string } | null;

    return { response, responseData };
  }

  private throwRequestError(status: number, responseData: unknown): never {
    const payload = responseData as { message?: string; error?: string } | null;
    const responseMessage = [payload?.message, payload?.error].filter(Boolean).join(" · ");
    const error = new Error(
      responseMessage || `Request failed: ${status}`,
    ) as Error & {
      status?: number;
      payload?: unknown;
    };
    error.status = status;
    error.payload = responseData;
    throw error;
  }
}
