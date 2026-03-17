import { ReportRange } from "../model/SalesReport";
import { ReportingService } from "../services/ReportingService";

export class ReportingInsightsPage {
  constructor(private readonly service: ReportingService) {}

  async loadKpis(businessId: number, range: ReportRange, token: string): Promise<{ income: number; earnings: number; bestSeller: string }> {
    const summary = await this.service.getSummaryByRange(businessId, range, token);

    return {
      income: summary.income,
      earnings: summary.earnings,
      bestSeller: summary.bestSeller,
    };
  }
}
