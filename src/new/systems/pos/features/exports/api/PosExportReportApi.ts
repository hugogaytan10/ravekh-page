import { HttpClient } from "../../../../core/api/HttpClient";
import { IExportReportRepository } from "../interface/IExportReportRepository";
import { ExportReport, ExportReportItem, ExportReportScope, ReportPeriod } from "../model/ExportReport";

type RawReportItem = {
  Id?: number;
  id?: number;
  ProductId?: number;
  productId?: number;
  EmployeeId?: number;
  employeeId?: number;
  CustomerId?: number;
  customerId?: number;
  Name?: string;
  name?: string;
  ProductName?: string;
  productName?: string;
  EmployeeName?: string;
  employeeName?: string;
  CustomerName?: string;
  customerName?: string;
  Price?: number;
  price?: number;
  Earnings?: number;
  earnings?: number;
  CoinId?: number | null;
  coinId?: number | null;
  TotalSales?: number | null;
  totalSales?: number | null;
  TotalOrders?: number | null;
  totalOrders?: number | null;
  Quantity?: number;
  quantity?: number;
  Total?: number;
  total?: number;
};

export class PosExportReportApi implements IExportReportRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getByScopeAndPeriod(
    businessId: number,
    scope: ExportReportScope,
    period: ReportPeriod,
    token: string,
  ): Promise<ExportReport> {
    const response = await this.httpClient.request<RawReportItem[]>({
      method: "GET",
      path: `report/${this.mapScope(scope)}/${period}/${businessId}`,
      token,
    });

    const items = response.map((item) => this.toItem(item));
    return new ExportReport(businessId, scope, period, items);
  }

  private mapScope(scope: ExportReportScope): string {
    if (scope === "employees") {
      return "employee";
    }

    if (scope === "customers") {
      return "customer";
    }

    return "products";
  }

  private toItem(item: RawReportItem): ExportReportItem {
    const id = Number(item.Id ?? item.id ?? item.ProductId ?? item.productId ?? item.EmployeeId ?? item.employeeId ?? item.CustomerId ?? item.customerId ?? 0);
    const label = item.Name
      ?? item.name
      ?? item.ProductName
      ?? item.productName
      ?? item.EmployeeName
      ?? item.employeeName
      ?? item.CustomerName
      ?? item.customerName
      ?? "Sin nombre";
    const quantity = Number(item.Quantity ?? item.quantity ?? item.TotalOrders ?? item.totalOrders ?? 0);
    const total = Number(item.Total ?? item.total ?? item.TotalSales ?? item.totalSales ?? 0);
    const price = Number(item.Price ?? item.price ?? 0);
    const earnings = Number(item.Earnings ?? item.earnings ?? total);
    const coinId = item.CoinId ?? item.coinId ?? null;

    return new ExportReportItem(
      id,
      label,
      Number.isFinite(quantity) ? quantity : 0,
      Number.isFinite(total) ? total : 0,
      Number.isFinite(price) ? price : 0,
      Number.isFinite(earnings) ? earnings : 0,
      coinId,
    );
  }
}
