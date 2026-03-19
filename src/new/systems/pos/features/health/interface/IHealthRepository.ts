import { HealthStatus } from "../model/HealthStatus";

export interface IHealthRepository {
  check(): Promise<HealthStatus>;
}
