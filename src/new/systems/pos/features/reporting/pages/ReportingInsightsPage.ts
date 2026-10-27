import { IncomePoint, ReportLeaderboardItem, ReportProductItem, ReportRange, ReportSale, SalesSummary, SalesTicketsPage } from "../model/SalesReport";
import { ReportingService } from "../services/ReportingService";

export interface ReportSummaryViewModel {
  balance: number;
  income: number;
  earnings: number;
  averageSale: number;
  totalSales: number;
  cashSalesPercentage: number;
  cardSalesPercentage: number;
  bestSeller: string;
  bestCategory: string;
}

const toViewModel = (summary: SalesSummary): ReportSummaryViewModel => ({
  balance: summary.balance,
  income: summary.income,
  earnings: summary.earnings,
  averageSale: summary.averageSale,
  totalSales: summary.totalSales,
  cashSalesPercentage: summary.cashSalesPercentage,
  cardSalesPercentage: summary.cardSalesPercentage,
  bestSeller: summary.bestSeller,
  bestCategory: summary.bestCategory,
});

export class ReportingInsightsPage {
  constructor(private readonly service: ReportingService) {}

  async loadSummary(businessId: number, range: ReportRange, token?: string, branchId?: number): Promise<ReportSummaryViewModel> {
    const summary = await this.service.getSummaryByRange(businessId, range, token?.trim(), branchId);
    return toViewModel(summary);
  }

  async loadIncomeSeries(businessId: number, range: ReportRange, token?: string, branchId?: number): Promise<IncomePoint[]> {
    return this.service.getIncomeSeries(businessId, range, token?.trim(), branchId);
  }

  async loadSalesDetails(
    businessId: number,
    range: ReportRange,
    payment: "TODOS" | "EFECTIVO" | "TARJETA",
    token: string,
    branchId?: number,
  ): Promise<ReportSale[]> {
    return this.service.getSalesDetails(businessId, range, payment, token.trim(), branchId);
  }

  async loadSalesTicketsByDateRange(
    businessId: number,
    from: string,
    to: string,
    timezone: string,
    page: number,
    pageSize: number,
    token: string,
    branchId?: number,
  ): Promise<SalesTicketsPage> {
    return this.service.getSalesTicketsByDateRange(
      businessId,
      from,
      to,
      timezone,
      page,
      pageSize,
      token.trim(),
      branchId,
    );
  }

  async loadProductsLeaderboard(businessId: number, range: ReportRange, token: string, branchId?: number): Promise<ReportProductItem[]> {
    return this.service.getProductsLeaderboard(businessId, range, token.trim(), branchId);
  }

  async loadEmployeesLeaderboard(businessId: number, range: ReportRange, token: string, branchId?: number): Promise<ReportLeaderboardItem[]> {
    return this.service.getEmployeesLeaderboard(businessId, range, token.trim(), branchId);
  }

  async loadCustomersLeaderboard(businessId: number, range: ReportRange, token: string, branchId?: number): Promise<ReportLeaderboardItem[]> {
    return this.service.getCustomersLeaderboard(businessId, range, token.trim(), branchId);
  }
}
