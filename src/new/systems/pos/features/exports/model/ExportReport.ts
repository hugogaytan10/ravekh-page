export type ReportPeriod = "today" | "month" | "year";
export type ExportReportScope = "products" | "employees" | "customers";

export class ExportReportItem {
  constructor(
    public readonly id: number,
    public readonly label: string,
    public readonly quantity: number,
    public readonly total: number,
    public readonly price: number,
    public readonly earnings: number,
    public readonly coinId: number | null,
  ) {}

  get hasActivity(): boolean {
    return this.quantity > 0 || this.total > 0 || this.earnings > 0;
  }
}

export class ExportReport {
  constructor(
    public readonly businessId: number,
    public readonly scope: ExportReportScope,
    public readonly period: ReportPeriod,
    public readonly items: ExportReportItem[],
  ) {}

  hasData(): boolean {
    return this.items.length > 0;
  }
}
