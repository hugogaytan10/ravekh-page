import { HttpClient } from "../../../../core/api/HttpClient";
import { IReportingRepository } from "../interface/IReportingRepository";
import { IncomePoint, ReportRange, SalesReport, SalesSummary } from "../model/SalesReport";

type LegacyReportPeriodResponse = {
  Balance: number;
  Income: number;
  Earnings: number;
  AverageSale: number;
  SalesTotal: number;
  CashSales: number;
  CardSales: number;
  MostSoldProduct: string;
  MostSoldCategory: string;
};

type LegacyReportResponse = {
  Day: LegacyReportPeriodResponse;
  Month: LegacyReportPeriodResponse;
  Year: LegacyReportPeriodResponse;
};

type LegacyIncomePointResponse = {
  Date?: string;
  date?: string;
  Amount?: number;
  amount?: number;
};

export class PosReportingApi implements IReportingRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getSalesReport(businessId: number, token?: string): Promise<SalesReport> {
    const report = await this.httpClient.request<LegacyReportResponse>({
      method: "GET",
      path: `report/${businessId}`,
      token,
    });

    return new SalesReport(
      businessId,
      this.toSummary(report.Day),
      this.toSummary(report.Month),
      this.toSummary(report.Year),
    );
  }

  async getIncomeSeries(businessId: number, range: ReportRange, token?: string): Promise<IncomePoint[]> {
    const suffix = range === "DAY" ? "today" : range === "MONTH" ? "month" : "year";

    const response = await this.httpClient.request<LegacyIncomePointResponse[]>({
      method: "GET",
      path: `income/${suffix}/${businessId}`,
      token,
    });

    return response.map(
      (item) => new IncomePoint(item.Date ?? item.date ?? "", item.Amount ?? item.amount ?? 0),
    );
  }

  private toSummary(period: LegacyReportPeriodResponse): SalesSummary {
    return new SalesSummary(
      period.Balance,
      period.Income,
      period.Earnings ?? 0,
      period.AverageSale,
      period.SalesTotal,
      period.CashSales,
      period.CardSales,
      period.MostSoldProduct,
      period.MostSoldCategory,
    );
  }
}
