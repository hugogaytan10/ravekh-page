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
