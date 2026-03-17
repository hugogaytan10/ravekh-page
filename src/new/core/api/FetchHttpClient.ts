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

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (request.token) {
      headers.Authorization = `Bearer ${request.token}`;
      headers.token = request.token;
    }

    const response = await fetch(url.toString(), {
      method: request.method,
      headers,
      body: request.body ? JSON.stringify(request.body) : undefined,
    });

    const responseData = (await response.json().catch(() => null)) as TResponse | { message?: string } | null;

    if (!response.ok) {
      throw new Error((responseData as { message?: string } | null)?.message ?? `Request failed: ${response.status}`);
    }

    return responseData as TResponse;
  }
}
