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
    const response = await this.httpClient.request<RawReportItem[] | RawReportItem | null>({
      method: "GET",
      path: `report/${this.mapScope(scope)}/${period}/${businessId}`,
      token,
    });

    const normalized = Array.isArray(response) ? response : response ? [response] : [];
    const items = normalized.map((item) => this.toItem(item));
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
    const id = this.toNumber(item.Id ?? item.id ?? item.ProductId ?? item.productId ?? item.EmployeeId ?? item.employeeId ?? item.CustomerId ?? item.customerId);
    const label = this.toText(item.Name
      ?? item.name
      ?? item.ProductName
      ?? item.productName
      ?? item.EmployeeName
      ?? item.employeeName
      ?? item.CustomerName
      ?? item.customerName
      ?? "Sin nombre");
    const quantity = this.toNumber(item.Quantity ?? item.quantity ?? item.TotalOrders ?? item.totalOrders);
    const total = this.toNumber(item.Total ?? item.total ?? item.TotalSales ?? item.totalSales);
    const price = this.toNumber(item.Price ?? item.price);
    const earnings = this.toNumber(item.Earnings ?? item.earnings ?? total);
    const coinId = item.CoinId ?? item.coinId ?? null;

    return new ExportReportItem(
      id,
      label,
      quantity,
      total,
      price,
      earnings,
      coinId,
    );
  }

  private toNumber(value: unknown): number {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private toText(value: unknown): string {
    if (typeof value !== "string") return "Sin nombre";
    const clean = value.trim();
    return clean.length > 0 ? clean : "Sin nombre";
  }
}
