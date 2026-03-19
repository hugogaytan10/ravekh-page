import { FinanceTrackingService } from "../services/FinanceTrackingService";

export type FinanceOverviewViewModel = {
  monthIncome: number;
  monthExpenses: number;
  monthBalance: number;
  todayIncome: number;
  todayExpenses: number;
};

export class FinanceTrackingPage {
  constructor(private readonly service: FinanceTrackingService) {}

  async loadOverview(businessId: number, token: string): Promise<FinanceOverviewViewModel> {
    const overview = await this.service.getOverview(businessId, token);

    return {
      monthIncome: overview.monthIncome,
      monthExpenses: overview.monthExpenses,
      monthBalance: overview.monthBalance,
      todayIncome: overview.todayIncome,
      todayExpenses: overview.todayExpenses,
    };
  }
}
