import { HttpClient } from "../../../../core/api/HttpClient";
import { IReportingRepository } from "../interface/IReportingRepository";
import { IncomePoint, ReportRange, SalesReport, SalesSummary } from "../model/SalesReport";

type NullableNumber = number | string | null | undefined;
type NullableText = string | null | undefined;

type LegacyReportPeriodResponse = {
  Balance?: NullableNumber;
  Income?: NullableNumber;
  Earnings?: NullableNumber;
  AverageSale?: NullableNumber;
  SalesTotal?: NullableNumber;
  CashSales?: NullableNumber;
  CardSales?: NullableNumber;
  MostSoldProduct?: NullableText;
  MostSoldCategory?: NullableText;
};

type LegacyReportResponse = {
  Day?: LegacyReportPeriodResponse | null;
  Month?: LegacyReportPeriodResponse | null;
  Year?: LegacyReportPeriodResponse | null;
};

type LegacyIncomePointResponse = {
  Date?: NullableText;
  date?: NullableText;
  Amount?: NullableNumber;
  amount?: NullableNumber;
};

const toNumber = (value: NullableNumber): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toText = (value: NullableText, fallback = "Sin datos"): string => {
  const normalized = `${value ?? ""}`.trim();
  return normalized.length > 0 ? normalized : fallback;
};

const toIncomePoint = (item: LegacyIncomePointResponse): IncomePoint =>
  IncomePoint.normalize({
    dateLabel: item.Date ?? item.date,
    amount: item.Amount ?? item.amount,
  });

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

    if (!Array.isArray(response) || response.length === 0) {
      return [];
    }

    return response
      .map(toIncomePoint)
      .filter((point) => Number.isFinite(point.amount));
  }

  private toSummary(period?: LegacyReportPeriodResponse | null): SalesSummary {
    if (!period) {
      return SalesSummary.empty();
    }

    return SalesSummary.normalize({
      balance: toNumber(period.Balance),
      income: toNumber(period.Income),
      earnings: toNumber(period.Earnings),
      averageSale: toNumber(period.AverageSale),
      totalSales: toNumber(period.SalesTotal),
      cashSalesPercentage: toNumber(period.CashSales),
      cardSalesPercentage: toNumber(period.CardSales),
      bestSeller: toText(period.MostSoldProduct),
      bestCategory: toText(period.MostSoldCategory),
    });
  }
}
