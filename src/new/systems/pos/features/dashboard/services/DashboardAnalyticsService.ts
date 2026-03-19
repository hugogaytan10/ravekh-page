import { IDashboardRepository } from "../interface/IDashboardRepository";
import { DashboardSnapshot } from "../model/DashboardMetrics";

export class DashboardAnalyticsService {
  constructor(private readonly repository: IDashboardRepository) {}

  async getMonthlySnapshot(businessId: number, month: number, token: string): Promise<DashboardSnapshot> {
    return this.repository.getSnapshot(businessId, month, token);
  }
}
