export class CashClosing {
  constructor(
    public readonly id: number,
    public readonly employeeId: number,
    public readonly openingAmount: number,
    public readonly expectedAmount: number,
    public readonly countedAmount: number,
    public readonly difference: number,
  ) {}

  isBalanced(): boolean {
    return this.difference === 0;
  }
}

export interface CreateCashClosingDto {
  employeeId: number;
  openingAmount: number;
  expectedAmount: number;
  countedAmount: number;
}
