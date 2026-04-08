import { HttpClient } from "../../../../core/api/HttpClient";
import { IDashboardRepository } from "../interface/IDashboardRepository";
import { ComparisonMetric, DashboardSnapshot, TopSellingItem } from "../model/DashboardMetrics";

type ComparisonTotals = {
  averageToday?: number;
  averageYesterday?: number;
  thisMonthTotal?: number;
  lastMonthTotal?: number;
  thisMonthBalance?: number;
  lastMonthBalance?: number;
};

type ComparisonResponse = {
  current?: number;
  previous?: number;
  Current?: number;
  Previous?: number;
  total?: ComparisonTotals;
  Total?: ComparisonTotals;
};
type TopItemResponse = {
  Id?: number;
  id?: number;
  Name?: string;
  name?: string;
  ProductName?: string;
  productName?: string;
  CategoryName?: string;
  categoryName?: string;
  Quantity?: number;
  quantity?: number;
  TotalQuantity?: number;
  totalQuantity?: number;
  TotalSales?: number;
  totalSales?: number;
};

type DataWrapper<T> = { Data?: T; data?: T; Result?: T; result?: T; Payload?: T; payload?: T };

export class PosDashboardApi implements IDashboardRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAveragePurchaseComparison(businessId: number, token: string): Promise<ComparisonMetric> {
    const payload = await this.httpClient.request<ComparisonResponse | DataWrapper<ComparisonResponse>>({
      method: "GET",
      path: `report2/average-purchase-comparison/${businessId}`,
      token,
    });
    return this.mapComparison(this.unwrapPayload(payload));
  }

  async getIncomeComparisonByMonth(businessId: number, token: string): Promise<ComparisonMetric> {
    const payload = await this.httpClient.request<ComparisonResponse | DataWrapper<ComparisonResponse>>({
      method: "GET",
      path: `report2/income-comparison-by-month/${businessId}`,
      token,
    });
    return this.mapComparison(this.unwrapPayload(payload));
  }

  async getBalanceComparisonByMonth(businessId: number, token: string): Promise<ComparisonMetric> {
    const payload = await this.httpClient.request<ComparisonResponse | DataWrapper<ComparisonResponse>>({
      method: "GET",
      path: `report2/balance-comparison-by-month/${businessId}`,
      token,
    });
    return this.mapComparison(this.unwrapPayload(payload));
  }

  async getMostSoldProductsByMonth(businessId: number, month: number, token: string): Promise<TopSellingItem[]> {
    const monthToken = String(month).padStart(2, "0");
    const payload = await this.httpClient.request<TopItemResponse[] | DataWrapper<TopItemResponse[]>>({
      method: "GET",
      path: `report2/most-sold-products-by-month/${businessId}/${monthToken}`,
      token,
    });
    return this.mapTopItems(this.normalizeTopItemsInput(this.unwrapPayload(payload)));
  }

  async getMostSoldCategoriesByMonth(businessId: number, month: number, token: string): Promise<TopSellingItem[]> {
    const monthToken = String(month).padStart(2, "0");
    const payload = await this.httpClient.request<TopItemResponse[] | DataWrapper<TopItemResponse[]>>({
      method: "GET",
      path: `report2/most-sold-categories-by-month/${businessId}/${monthToken}`,
      token,
    });
    return this.mapTopItems(this.normalizeTopItemsInput(this.unwrapPayload(payload)));
  }

  async getNewCustomersToday(businessId: number, token: string): Promise<number> {
    const payload = await this.httpClient.request<
      { total?: number; Total?: number; totalToday?: number; TotalToday?: number } | DataWrapper<{ total?: number; Total?: number; totalToday?: number; TotalToday?: number }>
    >({
      method: "GET",
      path: `report2/customers-added-today/${businessId}`,
      token,
    });
    const data = this.unwrapPayload(payload);
    return Number(data.totalToday ?? data.TotalToday ?? data.total ?? data.Total ?? 0);
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
    const totals = response.total ?? response.Total;
    const current = response.current ?? response.Current ?? totals?.averageToday ?? totals?.thisMonthTotal ?? totals?.thisMonthBalance ?? 0;
    const previous = response.previous ?? response.Previous ?? totals?.averageYesterday ?? totals?.lastMonthTotal ?? totals?.lastMonthBalance ?? 0;

    return new ComparisonMetric(Number(current), Number(previous));
  }

  private mapTopItems(response: TopItemResponse[] = []): TopSellingItem[] {
    return response
      .map(
        (item) =>
          new TopSellingItem(
            Number(item.id ?? item.Id ?? 0),
            item.name ?? item.Name ?? item.productName ?? item.ProductName ?? item.categoryName ?? item.CategoryName ?? "Sin nombre",
            Number(item.quantity ?? item.Quantity ?? item.totalQuantity ?? item.TotalQuantity ?? item.totalSales ?? item.TotalSales ?? 0),
          ),
      )
      .filter((item) => item.name.trim().length > 0 && Number.isFinite(item.quantity) && item.quantity >= 0);
  }

  private normalizeTopItemsInput(payload: unknown): TopItemResponse[] {
    if (Array.isArray(payload)) {
      return payload as TopItemResponse[];
    }

    if (payload && typeof payload === "object") {
      const record = payload as Record<string, unknown>;
      const candidates = [
        record.items,
        record.Items,
        record.rows,
        record.Rows,
        record.top,
        record.Top,
        record.products,
        record.Products,
        record.categories,
        record.Categories,
      ];

      for (const candidate of candidates) {
        if (Array.isArray(candidate)) {
          return candidate as TopItemResponse[];
        }
      }
    }

    return [];
  }

  private unwrapPayload<T>(payload: T | DataWrapper<T>): T {
    if (payload && typeof payload === "object") {
      const wrapped = payload as DataWrapper<T>;
      return wrapped.data ?? wrapped.Data ?? wrapped.result ?? wrapped.Result ?? wrapped.payload ?? wrapped.Payload ?? (payload as T);
    }

    return payload as T;
  }
}
