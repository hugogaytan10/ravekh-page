import { IncomePoint, ReportRange, ReportSale, SalesReport } from "../model/SalesReport";

export interface IReportingRepository {
  getSalesReport(businessId: number, token?: string): Promise<SalesReport>;
  getIncomeSeries(businessId: number, range: ReportRange, token?: string): Promise<IncomePoint[]>;
  getSalesDetails(businessId: number, range: ReportRange, payment: "TODOS" | "EFECTIVO" | "TARJETA", token: string): Promise<ReportSale[]>;
}
