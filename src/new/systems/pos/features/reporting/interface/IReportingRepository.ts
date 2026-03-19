import { IncomePoint, ReportRange, SalesReport } from "../model/SalesReport";

export interface IReportingRepository {
  getSalesReport(businessId: number, token?: string): Promise<SalesReport>;
  getIncomeSeries(businessId: number, range: ReportRange, token?: string): Promise<IncomePoint[]>;
}
