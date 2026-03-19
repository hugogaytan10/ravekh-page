import { IFinanceRepository } from "../interface/IFinanceRepository";
import { CreateFinanceEntryInput, FinanceEntry, FinanceOverview } from "../model/FinanceEntry";

export class FinanceTrackingService {
  constructor(private readonly repository: IFinanceRepository) {}

  async getOverview(businessId: number, token: string): Promise<FinanceOverview> {
    return this.repository.getOverview(businessId, token);
  }

  async getMonthMovement(businessId: number, month: number, token: string): Promise<{ income: FinanceEntry[]; expenses: FinanceEntry[] }> {
    const [income, expenses] = await Promise.all([
      this.repository.getIncomeByMonth(businessId, month, token),
      this.repository.getExpensesByMonth(businessId, month, token),
    ]);

    return { income, expenses };
  }

  async registerIncome(input: CreateFinanceEntryInput, token: string): Promise<FinanceEntry> {
    return this.repository.createIncome(input, token);
  }

  async registerExpense(input: CreateFinanceEntryInput, token: string): Promise<FinanceEntry> {
    return this.repository.createExpense(input, token);
  }
}
