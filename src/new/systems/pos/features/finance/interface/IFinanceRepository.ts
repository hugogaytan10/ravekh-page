import { CreateFinanceEntryInput, FinanceEntry, FinanceOverview } from "../model/FinanceEntry";

export interface IFinanceRepository {
  getOverview(businessId: number, token: string): Promise<FinanceOverview>;
  getIncomeByMonth(businessId: number, month: number, token: string): Promise<FinanceEntry[]>;
  getExpensesByMonth(businessId: number, month: number, token: string): Promise<FinanceEntry[]>;
  createIncome(input: CreateFinanceEntryInput, token: string): Promise<FinanceEntry>;
  createExpense(input: CreateFinanceEntryInput, token: string): Promise<FinanceEntry>;
}
