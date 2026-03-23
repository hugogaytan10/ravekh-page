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
  Dia?: LegacyReportPeriodResponse | null;
  dia?: LegacyReportPeriodResponse | null;
  Month?: LegacyReportPeriodResponse | null;
  month?: LegacyReportPeriodResponse | null;
  Mes?: LegacyReportPeriodResponse | null;
  mes?: LegacyReportPeriodResponse | null;
  Year?: LegacyReportPeriodResponse | null;
  year?: LegacyReportPeriodResponse | null;
  Anio?: LegacyReportPeriodResponse | null;
  anio?: LegacyReportPeriodResponse | null;
  Año?: LegacyReportPeriodResponse | null;
  año?: LegacyReportPeriodResponse | null;
  Data?: LegacyReportResponse;
  data?: LegacyReportResponse;
};

type LegacyIncomePointResponse = {
  Date?: NullableText;
  date?: NullableText;
  Amount?: NullableNumber;
  amount?: NullableNumber;
};

type LegacyDataWrapper<T> = {
  Data?: T;
  data?: T;
  Result?: T;
  result?: T;
  Payload?: T;
  payload?: T;
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
  Status?: string;
  status?: string;
  Quantity?: NullableNumber;
  quantity?: NullableNumber;
  ProductName?: string;
  productName?: string;
  Name?: string;
  name?: string;
  Address?: string;
  address?: string;
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

const toNumericValue = (value: unknown): number => {
  if (typeof value === "number" || typeof value === "string") {
    return toNumber(value);
  }

  if (Array.isArray(value)) {
    return value.reduce((accumulator, row) => accumulator + toNumericValue(row), 0);
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const directValue = record.total ?? record.Total ?? record.amount ?? record.Amount ?? record.value ?? record.Value;
    if (directValue !== undefined) {
      return toNumericValue(directValue);
    }

    const nestedCurrencyList = record.TotalsByCurrency ?? record.totalsByCurrency;
    if (nestedCurrencyList !== undefined) {
      return toNumericValue(nestedCurrencyList);
    }
  }

  return 0;
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

const mapRangeToLegacyDate = (range: ReportRange): "DÍA" | "MES" | "AÑO" => {
  if (range === "DAY") return "DÍA";
  if (range === "MONTH") return "MES";
  return "AÑO";
};

const unwrapPayload = <T>(payload: T | LegacyDataWrapper<T>): T => {
  if (payload && typeof payload === "object") {
    const wrappedPayload = payload as LegacyDataWrapper<T>;
    return wrappedPayload.data ?? wrappedPayload.Data ?? wrappedPayload.result ?? wrappedPayload.Result ?? wrappedPayload.payload ?? wrappedPayload.Payload ?? (payload as T);
  }

  return payload as T;
};

export class PosReportingApi implements IReportingRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getSalesReport(businessId: number, token?: string): Promise<SalesReport> {
    const payload = await this.httpClient.request<LegacyReportResponse>({
      method: "GET",
      path: `report/${businessId}`,
      token,
    });

    const report = this.unwrapReport(unwrapPayload(payload));

    return new SalesReport(
      businessId,
      this.toSummary(report.Day ?? report.day ?? report.Dia ?? report.dia),
      this.toSummary(report.Month ?? report.month ?? report.Mes ?? report.mes),
      this.toSummary(report.Year ?? report.year ?? report.Anio ?? report.anio ?? report.Año ?? report.año),
    );
  }

  async getIncomeSeries(businessId: number, range: ReportRange, token?: string): Promise<IncomePoint[]> {
    const suffix = range === "DAY" ? "today" : range === "MONTH" ? "month" : "year";

    const response = await this.httpClient.request<LegacyIncomePointResponse[] | LegacyDataWrapper<LegacyIncomePointResponse[]>>({
      method: "GET",
      path: `income/${suffix}/${businessId}`,
      token,
    });

    const rowsCandidate = unwrapPayload(response);
    const rows = Array.isArray(rowsCandidate) ? rowsCandidate : [];

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
    const payload = await this.httpClient.request<LegacySalesResponse | LegacyDataWrapper<LegacySalesResponse>>({
      method: "POST",
      path: "sales/payment",
      token,
      body: {
        business_Id: businessId,
        date: mapRangeToLegacyDate(range),
        payment,
      },
    });

    const unwrappedPayload = unwrapPayload(payload);
    const orders = unwrappedPayload.Orders ?? unwrappedPayload.orders ?? [];
    const commands = unwrappedPayload.Commands ?? unwrappedPayload.commands ?? [];

    return [
      ...orders.map((item) => this.toSale(item, "ORDER")),
      ...commands.map((item) => this.toSale(item, "COMMAND")),
    ]
      .filter((sale) => sale.id !== "0")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
      balance: toNumericValue(period.Balance ?? period.balance),
      income: toNumericValue(period.Income ?? period.income),
      earnings: toNumericValue(period.Earnings ?? period.earnings),
      averageSale: toNumericValue(period.AverageSale ?? period.averageSale),
      totalSales: toNumericValue(period.SalesTotal ?? period.salesTotal),
      cashSalesPercentage: toNumericValue(period.CashSales ?? period.cashSales),
      cardSalesPercentage: toNumericValue(period.CardSales ?? period.cardSales),
      bestSeller: toText(period.MostSoldProduct ?? period.mostSoldProduct),
      bestCategory: toText(period.MostSoldCategory ?? period.mostSoldCategory),
    });
  }

  private toSale(row: LegacySalesItem, type: "ORDER" | "COMMAND"): ReportSale {
    const fallbackDate = new Date().toISOString();

    return new ReportSale(
      String(row.Id ?? row.id ?? "0"),
      type,
      row.Date ?? row.date ?? fallbackDate,
      toText(row.PaymentMethod ?? row.paymentMethod, "N/A"),
      toText(row.CoinName ?? row.coinName, "MXN"),
      toNumber(row.Total ?? row.total),
      toText(row.ProductName ?? row.productName ?? row.Name ?? row.name, "Sin detalle"),
      toText(row.Address ?? row.address, "Sin dirección"),
      Math.max(1, Math.round(toNumber(row.Quantity ?? row.quantity) || 1)),
      toText(row.Status ?? row.status, "Pendiente"),
    );
  }
}
