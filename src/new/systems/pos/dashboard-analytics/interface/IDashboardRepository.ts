import { ComparisonMetric, DashboardSnapshot, TopSellingItem } from "../model/DashboardMetrics";

export interface IDashboardRepository {
  getAveragePurchaseComparison(businessId: number, token: string): Promise<ComparisonMetric>;
  getIncomeComparisonByMonth(businessId: number, token: string): Promise<ComparisonMetric>;
  getBalanceComparisonByMonth(businessId: number, token: string): Promise<ComparisonMetric>;
  getMostSoldProductsByMonth(businessId: number, month: number, token: string): Promise<TopSellingItem[]>;
  getMostSoldCategoriesByMonth(businessId: number, month: number, token: string): Promise<TopSellingItem[]>;
  getNewCustomersToday(businessId: number, token: string): Promise<number>;
  getSnapshot(businessId: number, month: number, token: string): Promise<DashboardSnapshot>;
}
