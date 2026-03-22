export type ReportRange = "DAY" | "MONTH" | "YEAR";

const toFiniteNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const clampPercentage = (value: number): number => Math.max(0, Math.min(100, value));

export class SalesSummary {
  constructor(
    public readonly balance: number,
    public readonly income: number,
    public readonly earnings: number,
    public readonly averageSale: number,
    public readonly totalSales: number,
    public readonly cashSalesPercentage: number,
    public readonly cardSalesPercentage: number,
    public readonly bestSeller: string,
    public readonly bestCategory: string,
  ) {}

  static empty(): SalesSummary {
    return new SalesSummary(0, 0, 0, 0, 0, 0, 0, "Sin datos", "Sin datos");
  }

  static normalize(payload: Partial<SalesSummary>): SalesSummary {
    return new SalesSummary(
      toFiniteNumber(payload.balance),
      toFiniteNumber(payload.income),
      toFiniteNumber(payload.earnings),
      toFiniteNumber(payload.averageSale),
      toFiniteNumber(payload.totalSales),
      clampPercentage(toFiniteNumber(payload.cashSalesPercentage)),
      clampPercentage(toFiniteNumber(payload.cardSalesPercentage)),
      payload.bestSeller?.trim() || "Sin datos",
      payload.bestCategory?.trim() || "Sin datos",
    );
  }

  hasPositiveEarnings(): boolean {
    return this.earnings >= 0;
  }
}

export class SalesReport {
  constructor(
    public readonly businessId: number,
    public readonly day: SalesSummary,
    public readonly month: SalesSummary,
    public readonly year: SalesSummary,
  ) {}

  static empty(businessId: number): SalesReport {
    const empty = SalesSummary.empty();
    return new SalesReport(businessId, empty, empty, empty);
  }

  getSummary(range: ReportRange): SalesSummary {
    if (range === "DAY") return this.day;
    if (range === "MONTH") return this.month;

    return this.year;
  }
}

export class IncomePoint {
  constructor(
    public readonly dateLabel: string,
    public readonly amount: number,
  ) {}

  static normalize(payload: Partial<IncomePoint>): IncomePoint {
    return new IncomePoint(payload.dateLabel?.trim() || "Sin fecha", toFiniteNumber(payload.amount));
  }
}
