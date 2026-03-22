import { IncomePoint, ReportRange, SalesSummary } from "../model/SalesReport";
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

  async loadSummary(businessId: number, range: ReportRange, token: string): Promise<ReportSummaryViewModel> {
    const summary = await this.service.getSummaryByRange(businessId, range, token.trim());
    return toViewModel(summary);
  }

  async loadIncomeSeries(businessId: number, range: ReportRange, token: string): Promise<IncomePoint[]> {
    return this.service.getIncomeSeries(businessId, range, token.trim());
  }
}
