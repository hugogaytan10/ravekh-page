import { IncomePoint, ReportLeaderboardItem, ReportProductItem, ReportRange, ReportSale, SalesReport, SalesTicketsPage } from "../model/SalesReport";

export interface IReportingRepository {
  getSalesReport(businessId: number, token?: string, branchId?: number): Promise<SalesReport>;
  getIncomeSeries(businessId: number, range: ReportRange, token?: string, branchId?: number): Promise<IncomePoint[]>;
  getSalesDetails(businessId: number, range: ReportRange, payment: "TODOS" | "EFECTIVO" | "TARJETA", token: string, branchId?: number): Promise<ReportSale[]>;
  getSalesTicketsByDateRange(businessId: number, from: string, to: string, timezone: string, page: number, pageSize: number, token: string, branchId?: number): Promise<SalesTicketsPage>;
  getProductsLeaderboard(businessId: number, range: ReportRange, token: string, branchId?: number): Promise<ReportProductItem[]>;
  getEmployeesLeaderboard(businessId: number, range: ReportRange, token: string, branchId?: number): Promise<ReportLeaderboardItem[]>;
  getCustomersLeaderboard(businessId: number, range: ReportRange, token: string, branchId?: number): Promise<ReportLeaderboardItem[]>;
}
