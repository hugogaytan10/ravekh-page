import { HealthService } from "../services/HealthService";

export type HealthVm = {
  status: string;
  checkedAt: string;
  healthy: boolean;
};

export class HealthPage {
  constructor(private readonly service: HealthService) {}

  async loadHealth(): Promise<HealthVm> {
    const health = await this.service.checkStatus();

    return {
      status: health.status,
      checkedAt: health.checkedAt,
      healthy: health.isHealthy(),
    };
  }
}
