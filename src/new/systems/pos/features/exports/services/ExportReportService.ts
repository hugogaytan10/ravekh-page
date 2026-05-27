import { IExportReportRepository } from "../interface/IExportReportRepository";
import { ExportReport, ExportReportScope, ReportPeriod } from "../model/ExportReport";

export class ExportReportService {
  constructor(private readonly repository: IExportReportRepository) {}

  async getReport(
    businessId: number,
    scope: ExportReportScope,
    period: ReportPeriod,
    token: string,
  ): Promise<ExportReport> {
    return this.repository.getByScopeAndPeriod(businessId, scope, period, token);
  }
}
