export interface HttpRequest {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  token?: string;
  /** Override de sucursal para una petición autenticada. */
  branchId?: number;
  /** Evita enviar X-Branch-Id (útil para /branches y autenticación). */
  skipBranchHeader?: boolean;
}

export interface HttpClient {
  request<TResponse>(request: HttpRequest): Promise<TResponse>;
  requestStatus?(request: HttpRequest): Promise<number>;
}
