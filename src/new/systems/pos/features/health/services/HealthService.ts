import { IHealthRepository } from "../interface/IHealthRepository";
import { HealthStatus } from "../model/HealthStatus";

export class HealthService {
  constructor(private readonly repository: IHealthRepository) {}

  async checkStatus(): Promise<HealthStatus> {
    return this.repository.check();
  }
}
