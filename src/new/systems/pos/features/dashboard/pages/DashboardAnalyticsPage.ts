import { DashboardAnalyticsService } from "../services/DashboardAnalyticsService";

export type DashboardViewModel = {
  averagePurchaseTrend: "UP" | "DOWN" | "FLAT";
  incomeTrend: "UP" | "DOWN" | "FLAT";
  balanceTrend: "UP" | "DOWN" | "FLAT";
  newCustomersToday: number;
  topProducts: Array<{ name: string; quantity: number }>;
  topCategories: Array<{ name: string; quantity: number }>;
};

export class DashboardAnalyticsPage {
  constructor(private readonly service: DashboardAnalyticsService) {}

  async loadViewModel(businessId: number, month: number, token: string): Promise<DashboardViewModel> {
    const snapshot = await this.service.getMonthlySnapshot(businessId, month, token);
    return {
      averagePurchaseTrend: snapshot.averagePurchase.trend,
      incomeTrend: snapshot.income.trend,
      balanceTrend: snapshot.balance.trend,
      newCustomersToday: snapshot.newCustomersToday,
      topProducts: snapshot.topProducts.map((item) => ({ name: item.name, quantity: item.quantity })),
      topCategories: snapshot.topCategories.map((item) => ({ name: item.name, quantity: item.quantity })),
    };
  }
}
