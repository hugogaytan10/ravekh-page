import { IncomePoint, ReportLeaderboardItem, ReportProductItem, ReportRange, ReportSale, SalesReport, SalesTicketsPage } from "../model/SalesReport";

export interface IReportingRepository {
  getSalesReport(businessId: number, token?: string): Promise<SalesReport>;
  getIncomeSeries(businessId: number, range: ReportRange, token?: string): Promise<IncomePoint[]>;
  getSalesDetails(businessId: number, range: ReportRange, payment: "TODOS" | "EFECTIVO" | "TARJETA", token: string): Promise<ReportSale[]>;
  getSalesTicketsByDateRange(businessId: number, from: string, to: string, timezone: string, page: number, pageSize: number, token: string): Promise<SalesTicketsPage>;
  getProductsLeaderboard(businessId: number, range: ReportRange, token: string): Promise<ReportProductItem[]>;
  getEmployeesLeaderboard(businessId: number, range: ReportRange, token: string): Promise<ReportLeaderboardItem[]>;
  getCustomersLeaderboard(businessId: number, range: ReportRange, token: string): Promise<ReportLeaderboardItem[]>;
}
