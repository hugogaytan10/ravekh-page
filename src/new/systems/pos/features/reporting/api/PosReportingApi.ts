import { HttpClient } from "../../../../core/api/HttpClient";
import { IReportingRepository } from "../interface/IReportingRepository";
import { IncomePoint, ReportLeaderboardItem, ReportProductItem, ReportRange, ReportSale, SalesReport, SalesSummary } from "../model/SalesReport";

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

type CatalogDetailProductResponse = {
  detailId?: NullableNumber;
  name?: NullableText;
  quantity?: NullableNumber;
  price?: NullableNumber;
  amount?: NullableNumber;
  detailAmount?: NullableNumber;
};

type CatalogDetailOrderResponse = {
  id?: NullableNumber;
  idType?: NullableText;
  type?: NullableText;
  address?: NullableText;
  date?: NullableText;
  status?: NullableText;
  products?: CatalogDetailProductResponse[];
};

type BackendCustomerItem = {
  CustomerId?: NullableNumber;
  CustomerName?: NullableText;
  TotalSales?: NullableNumber;
  TotalOrders?: NullableNumber;
};

type BackendEmployeeItem = {
  EmployeeId?: NullableNumber;
  EmployeeName?: NullableText;
  TotalSales?: NullableNumber;
  TotalOrders?: NullableNumber;
};

type BackendProductItem = {
  Id?: NullableNumber;
  Name?: NullableText;
  Quantity?: NullableNumber;
  TotalSales?: NullableNumber;
  Earnings?: NullableNumber;
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

const mapRangeToSuffix = (range: ReportRange): "today" | "month" | "year" => {
  if (range === "DAY") return "today";
  if (range === "MONTH") return "month";
  return "year";
};

const mapRangeToCatalogDetailsSuffix = (range: ReportRange): "today" | "month" => {
  if (range === "DAY") return "today";
  return "month";
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
    try {
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
    } catch {
      return SalesReport.empty(businessId);
    }
  }

  async getIncomeSeries(businessId: number, range: ReportRange, token?: string): Promise<IncomePoint[]> {
    const suffix = mapRangeToSuffix(range);

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
    void payment;

    const suffix = mapRangeToCatalogDetailsSuffix(range);
    const payload = await this.httpClient.request<CatalogDetailOrderResponse[] | LegacyDataWrapper<CatalogDetailOrderResponse[]>>({
      method: "GET",
      path: `report2/catalog-details-${suffix}/${businessId}`,
      token,
    });

    const rows = unwrapPayload(payload);
    if (!Array.isArray(rows)) return [];

    return rows
      .flatMap((row) => this.toCatalogSales(row))
      .filter((sale) => sale.id !== "0")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getProductsLeaderboard(businessId: number, range: ReportRange, token: string): Promise<ReportProductItem[]> {
    const suffix = mapRangeToSuffix(range);
    const payload = await this.httpClient.request<BackendProductItem[] | LegacyDataWrapper<BackendProductItem[]>>({
      method: "GET",
      path: `report/products/${suffix}/${businessId}`,
      token,
    });

    const rows = unwrapPayload(payload);
    if (!Array.isArray(rows)) return [];

    return rows
      .map((item) => new ReportProductItem(
        toNumber(item.Id),
        toText(item.Name, "Sin producto"),
        Math.max(0, Math.round(toNumber(item.Quantity))),
        toNumber(item.TotalSales),
        toNumber(item.Earnings),
      ))
      .filter((item) => item.name.trim().length > 0)
      .sort((a, b) => b.quantity - a.quantity || b.totalSales - a.totalSales);
  }

  async getEmployeesLeaderboard(businessId: number, range: ReportRange, token: string): Promise<ReportLeaderboardItem[]> {
    const suffix = mapRangeToSuffix(range);
    const payload = await this.httpClient.request<BackendEmployeeItem[] | LegacyDataWrapper<BackendEmployeeItem[]>>({
      method: "GET",
      path: `report/employee/${suffix}/${businessId}`,
      token,
    });

    const rows = unwrapPayload(payload);
    if (!Array.isArray(rows)) return [];

    return rows
      .map((item) => new ReportLeaderboardItem(
        Math.round(toNumber(item.EmployeeId)),
        toText(item.EmployeeName, "Sin empleado"),
        toNumber(item.TotalSales),
        Math.max(0, Math.round(toNumber(item.TotalOrders))),
      ))
      .filter((item) => item.name.trim().length > 0)
      .sort((a, b) => b.totalSales - a.totalSales || b.totalOrders - a.totalOrders);
  }

  async getCustomersLeaderboard(businessId: number, range: ReportRange, token: string): Promise<ReportLeaderboardItem[]> {
    const suffix = mapRangeToSuffix(range);
    const payload = await this.httpClient.request<BackendCustomerItem[] | LegacyDataWrapper<BackendCustomerItem[]>>({
      method: "GET",
      path: `report/customer/${suffix}/${businessId}`,
      token,
    });

    const rows = unwrapPayload(payload);
    if (!Array.isArray(rows)) return [];

    return rows
      .map((item) => new ReportLeaderboardItem(
        Math.round(toNumber(item.CustomerId)),
        toText(item.CustomerName, "Sin cliente"),
        toNumber(item.TotalSales),
        Math.max(0, Math.round(toNumber(item.TotalOrders))),
      ))
      .filter((item) => item.name.trim().length > 0)
      .sort((a, b) => b.totalSales - a.totalSales || b.totalOrders - a.totalOrders);
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

  private toCatalogSales(row: CatalogDetailOrderResponse): ReportSale[] {
    const baseId = String(row.id ?? "0");
    const createdAt = toText(row.date, new Date().toISOString());
    const address = toText(row.address, "Sin dirección");
    const status = toText(row.status, "Pendiente");
    const products = Array.isArray(row.products) ? row.products : [];

    return products.map((product, index) => {
      const productId = String(product.detailId ?? `${baseId}-${index}`);
      const quantity = Math.max(1, Math.round(toNumber(product.quantity) || 1));
      const total = toNumber(product.detailAmount) || (toNumber(product.amount) * quantity);

      return new ReportSale(
        `${baseId}-${productId}`,
        "ORDER",
        createdAt,
        "N/A",
        "MXN",
        total,
        toText(product.name, "Sin detalle"),
        address,
        quantity,
        status,
      );
    });
  }
}
