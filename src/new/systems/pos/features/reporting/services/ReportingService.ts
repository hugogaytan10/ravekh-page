import { IReportingRepository } from "../interface/IReportingRepository";
import { IncomePoint, ReportLeaderboardItem, ReportProductItem, ReportRange, ReportSale, SalesSummary, SalesTicketsPage } from "../model/SalesReport";

export class ReportingService {
  constructor(private readonly repository: IReportingRepository) {}

  async getSummaryByRange(businessId: number, range: ReportRange, token?: string, branchId?: number): Promise<SalesSummary> {
    const report = await this.repository.getSalesReport(businessId, token, branchId);
    return report.getSummary(range);
  }

  async getIncomeSeries(businessId: number, range: ReportRange, token?: string, branchId?: number): Promise<IncomePoint[]> {
    return this.repository.getIncomeSeries(businessId, range, token, branchId);
  }

  async getSalesDetails(
    businessId: number,
    range: ReportRange,
    payment: "TODOS" | "EFECTIVO" | "TARJETA",
    token: string,
    branchId?: number,
  ): Promise<ReportSale[]> {
    return this.repository.getSalesDetails(businessId, range, payment, token, branchId);
  }

  async getSalesTicketsByDateRange(
    businessId: number,
    from: string,
    to: string,
    timezone: string,
    page: number,
    pageSize: number,
    token: string,
    branchId?: number,
  ): Promise<SalesTicketsPage> {
    if (!from || !to || from > to) throw new Error("El rango de fechas no es válido.");
    return this.repository.getSalesTicketsByDateRange(businessId, from, to, timezone, page, pageSize, token, branchId);
  }

  async getProductsLeaderboard(businessId: number, range: ReportRange, token: string, branchId?: number): Promise<ReportProductItem[]> {
    return this.repository.getProductsLeaderboard(businessId, range, token, branchId);
  }

  async getEmployeesLeaderboard(businessId: number, range: ReportRange, token: string, branchId?: number): Promise<ReportLeaderboardItem[]> {
    return this.repository.getEmployeesLeaderboard(businessId, range, token, branchId);
  }

  async getCustomersLeaderboard(businessId: number, range: ReportRange, token: string, branchId?: number): Promise<ReportLeaderboardItem[]> {
    return this.repository.getCustomersLeaderboard(businessId, range, token, branchId);
  }
}
