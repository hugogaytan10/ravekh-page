export type FinanceRecordType = "INCOME" | "EXPENSE";

export interface FinanceRecord {
  id?: number;
  businessId: number;
  name: string;
  amount: number;
  type: FinanceRecordType;
  createdAt?: string;
}

export interface FinanceOverview {
  income: number;
  expenses: number;
  net: number;
}
