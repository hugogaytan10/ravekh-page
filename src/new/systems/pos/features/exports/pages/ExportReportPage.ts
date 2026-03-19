import { ExportReportService } from "../services/ExportReportService";
import { ExportReportScope, ReportPeriod } from "../model/ExportReport";

export interface ExportReportRowViewModel {
  label: string;
  quantity: number;
  total: number;
}

export class ExportReportPage {
  constructor(private readonly service: ExportReportService) {}

  async load(
    businessId: number,
    scope: ExportReportScope,
    period: ReportPeriod,
    token: string,
  ): Promise<ExportReportRowViewModel[]> {
    const report = await this.service.getReport(businessId, scope, period, token);
    return report.items.map((item) => ({
      label: item.label,
      quantity: item.quantity,
      total: item.total,
    }));
  }
}
