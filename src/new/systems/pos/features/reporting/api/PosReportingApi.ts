import { HttpClient } from "../../../../core/api/HttpClient";
import { IReportingRepository } from "../interface/IReportingRepository";
import { IncomePoint, ReportRange, ReportSale, SalesReport, SalesSummary } from "../model/SalesReport";

type NullableNumber = number | string | null | undefined;
type NullableText = string | null | undefined;

type LegacyReportPeriodResponse = {
  Balance?: NullableNumber;
  balance?: NullableNumber;
  Income?: NullableNumber;
  income?: NullableNumber;
  Earnings?: NullableNumber;
  earnings?: NullableNumber;
  AverageSale?: NullableNumber;
  averageSale?: NullableNumber;
  SalesTotal?: NullableNumber;
  salesTotal?: NullableNumber;
  CashSales?: NullableNumber;
  cashSales?: NullableNumber;
  CardSales?: NullableNumber;
  cardSales?: NullableNumber;
  MostSoldProduct?: NullableText;
  mostSoldProduct?: NullableText;
  MostSoldCategory?: NullableText;
  mostSoldCategory?: NullableText;
};

type LegacyReportResponse = {
  Day?: LegacyReportPeriodResponse | null;
  day?: LegacyReportPeriodResponse | null;
  Month?: LegacyReportPeriodResponse | null;
  month?: LegacyReportPeriodResponse | null;
  Year?: LegacyReportPeriodResponse | null;
  year?: LegacyReportPeriodResponse | null;
  Data?: LegacyReportResponse;
  data?: LegacyReportResponse;
};

type LegacyIncomePointResponse = {
  Date?: NullableText;
  date?: NullableText;
  Amount?: NullableNumber;
  amount?: NullableNumber;
};

type LegacySalesItem = {
  Id?: string | number;
  id?: string | number;
  Date?: string;
  date?: string;
  PaymentMethod?: string;
  paymentMethod?: string;
  CoinName?: string;
  coinName?: string;
  Total?: NullableNumber;
  total?: NullableNumber;
};

type LegacySalesResponse = {
  Orders?: LegacySalesItem[];
  orders?: LegacySalesItem[];
  Commands?: LegacySalesItem[];
  commands?: LegacySalesItem[];
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
    const payload = await this.httpClient.request<LegacyReportResponse>({
      method: "GET",
      path: `report/${businessId}`,
      token,
    });

    const report = this.unwrapReport(payload);

    return new SalesReport(
      businessId,
      this.toSummary(report.Day ?? report.day),
      this.toSummary(report.Month ?? report.month),
      this.toSummary(report.Year ?? report.year),
    );
  }

  async getIncomeSeries(businessId: number, range: ReportRange, token?: string): Promise<IncomePoint[]> {
    const suffix = range === "DAY" ? "today" : range === "MONTH" ? "month" : "year";

    const response = await this.httpClient.request<LegacyIncomePointResponse[] | { data?: LegacyIncomePointResponse[] }>({
      method: "GET",
      path: `income/${suffix}/${businessId}`,
      token,
    });

    const rows = Array.isArray(response) ? response : Array.isArray(response.data) ? response.data : [];

    if (rows.length === 0) {
      return [];
    }

    return rows.map(toIncomePoint).filter((point) => Number.isFinite(point.amount));
  }

  async getSalesDetails(
    businessId: number,
    range: ReportRange,
    payment: "TODOS" | "EFECTIVO" | "TARJETA",
    token: string,
  ): Promise<ReportSale[]> {
    const payload = await this.httpClient.request<LegacySalesResponse>({
      method: "POST",
      path: "sales/payment",
      token,
      body: {
        business_Id: businessId,
        date: range,
        payment,
      },
    });

    const orders = payload.Orders ?? payload.orders ?? [];
    const commands = payload.Commands ?? payload.commands ?? [];

    return [
      ...orders.map((item) => this.toSale(item, "ORDER")),
      ...commands.map((item) => this.toSale(item, "COMMAND")),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  private unwrapReport(payload: LegacyReportResponse): LegacyReportResponse {
    if (payload.data) return payload.data;
    if (payload.Data) return payload.Data;
    return payload;
  }

  private toSummary(period?: LegacyReportPeriodResponse | null): SalesSummary {
    if (!period) {
      return SalesSummary.empty();
    }

    return SalesSummary.normalize({
      balance: toNumber(period.Balance ?? period.balance),
      income: toNumber(period.Income ?? period.income),
      earnings: toNumber(period.Earnings ?? period.earnings),
      averageSale: toNumber(period.AverageSale ?? period.averageSale),
      totalSales: toNumber(period.SalesTotal ?? period.salesTotal),
      cashSalesPercentage: toNumber(period.CashSales ?? period.cashSales),
      cardSalesPercentage: toNumber(period.CardSales ?? period.cardSales),
      bestSeller: toText(period.MostSoldProduct ?? period.mostSoldProduct),
      bestCategory: toText(period.MostSoldCategory ?? period.mostSoldCategory),
    });
  }

  private toSale(row: LegacySalesItem, type: "ORDER" | "COMMAND"): ReportSale {
    return new ReportSale(
      String(row.Id ?? row.id ?? "0"),
      type,
      row.Date ?? row.date ?? "",
      toText(row.PaymentMethod ?? row.paymentMethod, "N/A"),
      toText(row.CoinName ?? row.coinName, "MXN"),
      toNumber(row.Total ?? row.total),
    );
  }
}
