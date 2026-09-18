import { IFinanceRepository } from "../interface/IFinanceRepository";
import { CreateFinanceEntryInput, FinanceEntry, FinanceOverview } from "../model/FinanceEntry";

export class FinanceTrackingService {
  constructor(private readonly repository: IFinanceRepository) {}

  async getOverview(businessId: number, token: string, branchId?: number): Promise<FinanceOverview> {
    return this.repository.getOverview(businessId, token, branchId);
  }

  async getMonthMovement(
    businessId: number,
    month: number,
    token: string,
    branchId?: number,
  ): Promise<{ income: FinanceEntry[]; expenses: FinanceEntry[] }> {
    const [income, expenses] = await Promise.all([
      this.repository.getIncomeByMonth(businessId, month, token, branchId),
      this.repository.getExpensesByMonth(businessId, month, token, branchId),
    ]);

    return { income, expenses };
  }

  async getTodayMovement(
    businessId: number,
    token: string,
    branchId?: number,
  ): Promise<{ income: FinanceEntry[]; expenses: FinanceEntry[] }> {
    const [income, expenses] = await Promise.all([
      this.repository.getIncomeToday(businessId, token, branchId),
      this.repository.getExpensesToday(businessId, token, branchId),
    ]);

    return { income, expenses };
  }

  async registerIncome(
    input: CreateFinanceEntryInput,
    token: string,
    branchId?: number,
  ): Promise<FinanceEntry> {
    return this.repository.createIncome(input, token, branchId);
  }

  async registerExpense(
    input: CreateFinanceEntryInput,
    token: string,
    branchId?: number,
  ): Promise<FinanceEntry> {
    return this.repository.createExpense(input, token, branchId);
  }
}
