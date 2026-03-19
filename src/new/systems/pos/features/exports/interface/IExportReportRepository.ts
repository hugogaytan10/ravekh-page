import { ExportReport, ExportReportScope, ReportPeriod } from "../model/ExportReport";

export interface IExportReportRepository {
  getByScopeAndPeriod(
    businessId: number,
    scope: ExportReportScope,
    period: ReportPeriod,
    token: string,
  ): Promise<ExportReport>;
}
