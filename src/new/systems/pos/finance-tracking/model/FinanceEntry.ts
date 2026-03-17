export class FinanceEntry {
  constructor(
    public readonly name: string,
    public readonly amount: number,
    public readonly createdAt?: string,
  ) {}
}

export class FinanceOverview {
  constructor(
    public readonly monthIncome: number,
    public readonly monthExpenses: number,
    public readonly todayIncome: number,
    public readonly todayExpenses: number,
  ) {}

  get monthBalance(): number {
    return this.monthIncome - this.monthExpenses;
  }
}

export type CreateFinanceEntryInput = {
  businessId: number;
  name: string;
  amount: number;
};
