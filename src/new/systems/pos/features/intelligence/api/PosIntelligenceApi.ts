import { HttpClient } from "../../../../../core/api/HttpClient";
import type { BusinessInsight, BusinessInsightHistoryResponse, BusinessIntelligenceResponse } from "../model/intelligence.types";

export class PosIntelligenceApi {
  constructor(private readonly client: HttpClient) {}
  load(token: string, refresh = false) {
    return this.client.request<BusinessIntelligenceResponse>({ method: "GET", path: "intelligence", token, query: refresh ? { refresh: 1 } : undefined });
  }
  history(token: string) {
    return this.client.request<BusinessInsightHistoryResponse>({ method: "GET", path: "intelligence/history", token, query: { limit: 50 } });
  }
  detail(token: string, id: number) {
    this.validateId(id);
    return this.client.request<BusinessInsight>({ method: "GET", path: `intelligence/${id}`, token });
  }
  markRead(token: string, id: number) {
    this.validateId(id);
    return this.client.request<BusinessInsight>({ method: "POST", path: `intelligence/${id}/read`, token });
  }
  dismiss(token: string, id: number) {
    this.validateId(id);
    return this.client.request<void>({ method: "POST", path: `intelligence/${id}/dismiss`, token });
  }
  private validateId(id: number) {
    if (!Number.isInteger(id) || id < 1) throw new Error("Identificador de análisis inválido.");
  }
}
