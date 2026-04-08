import { HttpClient, HttpRequest } from "./HttpClient";

export class FetchHttpClient implements HttpClient {
  constructor(private readonly baseUrl: string) {}

  async request<TResponse>(request: HttpRequest): Promise<TResponse> {
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

    if (request.token) {
      headers.Authorization = `Bearer ${request.token}`;
      headers.token = request.token;
    }

    const response = await fetch(url.toString(), {
      method: request.method,
      headers,
      body: request.body ? (isFormData ? request.body : JSON.stringify(request.body)) : null,
    });

    const responseData = (await response.json().catch(() => null)) as TResponse | { message?: string } | null;

    if (!response.ok) {
      const error = new Error((responseData as { message?: string } | null)?.message ?? `Request failed: ${response.status}`) as Error & {
        status?: number;
        payload?: unknown;
      };
      error.status = response.status;
      error.payload = responseData;
      throw error;
    }

    return responseData as TResponse;
  }
}
