import { fail, ok, type Result } from "../../../../shared/models/Result";
import type { FinanceGateway, FinanceUseCases } from "../interfaces/FinanceContracts";
import type { FinanceOverview, FinanceRecord } from "../models/FinanceRecord";

const toOverview = (incomeAmount: number, expenseAmount: number): FinanceOverview => ({
  income: incomeAmount,
  expenses: expenseAmount,
  net: incomeAmount - expenseAmount,
});

const sumAmounts = (records: FinanceRecord[]): number =>
  records.reduce((total, record) => total + (Number.isFinite(record.amount) ? record.amount : 0), 0);

export class FinanceService implements FinanceUseCases {
  constructor(private readonly financeGateway: FinanceGateway) {}

  async getOverviewByMonth(token: string, businessId: string, month: number): Promise<Result<FinanceOverview>> {
    try {
      const [income, expenses] = await Promise.all([
        this.financeGateway.listByMonth(token, businessId, "INCOME", month),
        this.financeGateway.listByMonth(token, businessId, "EXPENSE", month),
      ]);

      return ok(toOverview(sumAmounts(income), sumAmounts(expenses)), "Finance overview loaded.");
    } catch (error) {
      return fail("Failed to load finance overview.", error instanceof Error ? error.message : "Unknown error");
    }
  }

  async getOverviewToday(token: string, businessId: string): Promise<Result<FinanceOverview>> {
    try {
      const [income, expenses] = await Promise.all([
        this.financeGateway.listToday(token, businessId, "INCOME"),
        this.financeGateway.listToday(token, businessId, "EXPENSE"),
      ]);

      return ok(toOverview(sumAmounts(income), sumAmounts(expenses)), "Today finance overview loaded.");
    } catch (error) {
      return fail(
        "Failed to load today finance overview.",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  }

  async createRecord(token: string, record: FinanceRecord): Promise<Result<FinanceRecord>> {
    return this.financeGateway.create(token, record);
  }
}
