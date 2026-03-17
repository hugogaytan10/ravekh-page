export type ReportRange = "DAY" | "MONTH" | "YEAR";

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
}
