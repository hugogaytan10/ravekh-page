export class CashClosing {
  constructor(
    public readonly id: number,
    public readonly employeeId: number,
    public readonly total: number,
    public readonly date: string,
    public readonly employeeName: string = "",
  ) {}
}

export interface CreateCashClosingDto {
  employeeId: number;
}

export type CashClosingPreview = { total: number; currency: string };

export const cashClosingCsv = (rows: Array<{ id: number; date: string; employeeName: string; total: number }>): string => {
  const cell = (value: unknown) => {
    const text = String(value ?? "");
    return `"${(typeof value === "string" && /^[=+\-@\t\r\n]/.test(text) ? "'" + text : text).replace(/"/g, '""')}"`;
  };
  return [["Corte", "Fecha", "Empleado", "Total"], ...rows.map(row => [row.id, row.date, row.employeeName, row.total])].map(row => row.map(cell).join(",")).join("\r\n");
};
