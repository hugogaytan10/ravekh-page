import { ExportReportService } from "../services/ExportReportService";
import { ExportReportScope, ReportPeriod } from "../model/ExportReport";

export interface ExportReportRowViewModel {
  id: number;
  label: string;
  quantity: number;
  total: number;
  price: number;
  earnings: number;
  coinId: number | null;
  hasActivity: boolean;
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
      id: item.id,
      label: item.label,
      quantity: item.quantity,
      total: item.total,
      price: item.price,
      earnings: item.earnings,
      coinId: item.coinId,
      hasActivity: item.hasActivity,
    }));
  }
}
