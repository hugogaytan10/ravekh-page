import { IReportingRepository } from "../interface/IReportingRepository";
import { IncomePoint, ReportRange, ReportSale, SalesSummary } from "../model/SalesReport";

export class ReportingService {
  constructor(private readonly repository: IReportingRepository) {}

  async getSummaryByRange(businessId: number, range: ReportRange, token?: string): Promise<SalesSummary> {
    const report = await this.repository.getSalesReport(businessId, token);
    return report.getSummary(range);
  }

  async getIncomeSeries(businessId: number, range: ReportRange, token?: string): Promise<IncomePoint[]> {
    return this.repository.getIncomeSeries(businessId, range, token);
  }

  async getSalesDetails(
    businessId: number,
    range: ReportRange,
    payment: "TODOS" | "EFECTIVO" | "TARJETA",
    token: string,
  ): Promise<ReportSale[]> {
    return this.repository.getSalesDetails(businessId, range, payment, token);
  }
}
