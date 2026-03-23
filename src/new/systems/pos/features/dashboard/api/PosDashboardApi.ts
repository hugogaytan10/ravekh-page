import { HttpClient } from "../../../../core/api/HttpClient";
import { IDashboardRepository } from "../interface/IDashboardRepository";
import { ComparisonMetric, DashboardSnapshot, TopSellingItem } from "../model/DashboardMetrics";

type ComparisonResponse = { current?: number; previous?: number; Current?: number; Previous?: number };
type TopItemResponse = { Id?: number; id?: number; Name?: string; name?: string; Quantity?: number; quantity?: number };

export class PosDashboardApi implements IDashboardRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAveragePurchaseComparison(businessId: number, token: string): Promise<ComparisonMetric> {
    const data = await this.httpClient.get<ComparisonResponse>(`report2/average-purchase-comparison/${businessId}`, token);
    return this.mapComparison(data);
  }

  async getIncomeComparisonByMonth(businessId: number, token: string): Promise<ComparisonMetric> {
    const data = await this.httpClient.get<ComparisonResponse>(`report2/income-comparison-by-month/${businessId}`, token);
    return this.mapComparison(data);
  }

  async getBalanceComparisonByMonth(businessId: number, token: string): Promise<ComparisonMetric> {
    const data = await this.httpClient.get<ComparisonResponse>(`report2/balance-comparison-by-month/${businessId}`, token);
    return this.mapComparison(data);
  }

  async getMostSoldProductsByMonth(businessId: number, month: number, token: string): Promise<TopSellingItem[]> {
    const data = await this.httpClient.get<TopItemResponse[]>(`report2/most-sold-products-by-month/${businessId}/${month}`, token);
    return this.mapTopItems(data);
  }

  async getMostSoldCategoriesByMonth(businessId: number, month: number, token: string): Promise<TopSellingItem[]> {
    const data = await this.httpClient.get<TopItemResponse[]>(`report2/most-sold-categories-by-month/${businessId}/${month}`, token);
    return this.mapTopItems(data);
  }

  async getNewCustomersToday(businessId: number, token: string): Promise<number> {
    const data = await this.httpClient.get<{ total?: number; Total?: number }>(`report2/customers-added-today/${businessId}`, token);
    return Number(data.total ?? data.Total ?? 0);
  }

  async getSnapshot(businessId: number, month: number, token: string): Promise<DashboardSnapshot> {
    const [averagePurchase, income, balance, topProducts, topCategories, newCustomersToday] = await Promise.all([
      this.getAveragePurchaseComparison(businessId, token),
      this.getIncomeComparisonByMonth(businessId, token),
      this.getBalanceComparisonByMonth(businessId, token),
      this.getMostSoldProductsByMonth(businessId, month, token),
      this.getMostSoldCategoriesByMonth(businessId, month, token),
      this.getNewCustomersToday(businessId, token),
    ]);
    return new DashboardSnapshot(averagePurchase, income, balance, topProducts, topCategories, newCustomersToday);
  }

  private mapComparison(response: ComparisonResponse): ComparisonMetric {
    return new ComparisonMetric(Number(response.current ?? response.Current ?? 0), Number(response.previous ?? response.Previous ?? 0));
  }

  private mapTopItems(response: TopItemResponse[] = []): TopSellingItem[] {
    return response.map((item) => new TopSellingItem(Number(item.id ?? item.Id ?? 0), item.name ?? item.Name ?? "Unknown", Number(item.quantity ?? item.Quantity ?? 0)));
  }
}
