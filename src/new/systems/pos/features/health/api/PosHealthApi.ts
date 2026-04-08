import { HttpClient } from "../../../../core/api/HttpClient";
import { IHealthRepository } from "../interface/IHealthRepository";
import { HealthStatus } from "../model/HealthStatus";

type HealthResponse = {
  status?: string;
};

export class PosHealthApi implements IHealthRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async check(): Promise<HealthStatus> {
    const response = await this.httpClient.request<HealthResponse>({
      method: "GET",
      path: "health",
    });

    return new HealthStatus(response.status ?? "unknown", new Date().toISOString());
  }
}
