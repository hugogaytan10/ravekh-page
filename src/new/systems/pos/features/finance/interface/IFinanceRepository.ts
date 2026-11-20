import { CreateFinanceEntryInput, FinanceEntry, FinanceOverview } from "../model/FinanceEntry";

export interface IFinanceRepository {
  getOverview(businessId: number, token: string, branchId?: number, dayOnly?: boolean): Promise<FinanceOverview>;
  getRangeMovement(from: string, to: string, token: string, branchId?: number): Promise<{income: FinanceEntry[]; expenses: FinanceEntry[]}>;
  getIncomeToday(businessId: number, token: string, branchId?: number): Promise<FinanceEntry[]>;
  getExpensesToday(businessId: number, token: string, branchId?: number): Promise<FinanceEntry[]>;
  getIncomeByMonth(businessId: number, month: number, token: string, branchId?: number): Promise<FinanceEntry[]>;
  getExpensesByMonth(businessId: number, month: number, token: string, branchId?: number): Promise<FinanceEntry[]>;
  createIncome(input: CreateFinanceEntryInput, token: string, branchId?: number): Promise<FinanceEntry>;
  createExpense(input: CreateFinanceEntryInput, token: string, branchId?: number): Promise<FinanceEntry>;
}
