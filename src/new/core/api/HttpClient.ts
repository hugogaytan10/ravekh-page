export interface HttpRequest {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  token?: string;
}

export interface HttpClient {
  request<TResponse>(request: HttpRequest): Promise<TResponse>;
}
