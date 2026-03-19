export type ReportPeriod = "today" | "month" | "year";
export type ExportReportScope = "products" | "employees" | "customers";

export class ExportReportItem {
  constructor(
    public readonly label: string,
    public readonly quantity: number,
    public readonly total: number,
  ) {}
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
