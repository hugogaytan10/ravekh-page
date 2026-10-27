export class FinanceEntry {
  constructor(
    public readonly name: string,
    public readonly amount: number,
    public readonly createdAt?: string,
    public readonly id?: number,
    public readonly source?: string,
    public readonly orderId?: number | null,
    public readonly commandId?: number | null,
    public readonly branchId?: number,
    public readonly moneyTipe?: string,
  ) {}

  get isSale(): boolean {
    return Boolean(this.orderId || this.commandId || this.source === "POS" || this.source === "RESTAURANT");
  }

  get saleReference(): string | null {
    if (this.orderId) return `POS #${this.orderId}`;
    if (this.commandId) return `Restaurante #${this.commandId}`;
    return null;
  }
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
