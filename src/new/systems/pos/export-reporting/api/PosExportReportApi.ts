import { HttpClient } from "../../../../core/api/HttpClient";
import { IExportReportRepository } from "../interface/IExportReportRepository";
import { ExportReport, ExportReportItem, ExportReportScope, ReportPeriod } from "../model/ExportReport";

type RawReportItem = {
  Name?: string;
  name?: string;
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
    return new ExportReportItem(
      item.Name ?? item.name ?? "Unknown",
      item.Quantity ?? item.quantity ?? 0,
      item.Total ?? item.total ?? 0,
    );
  }
}
