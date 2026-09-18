import { FinanceTrackingService } from "../services/FinanceTrackingService";
import { CreateFinanceEntryInput, FinanceEntry } from "../model/FinanceEntry";

export type FinanceOverviewViewModel = {
  monthIncome: number;
  monthExpenses: number;
  monthBalance: number;
  todayIncome: number;
  todayExpenses: number;
};

export type FinanceMonthMovementViewModel = {
  income: FinanceEntry[];
  expenses: FinanceEntry[];
};

export class FinanceTrackingPage {
  constructor(private readonly service: FinanceTrackingService) {}

  async loadOverview(
    businessId: number,
    token: string,
    branchId?: number,
  ): Promise<FinanceOverviewViewModel> {
    const overview = await this.service.getOverview(businessId, token, branchId);

    return {
      monthIncome: overview.monthIncome,
      monthExpenses: overview.monthExpenses,
      monthBalance: overview.monthBalance,
      todayIncome: overview.todayIncome,
      todayExpenses: overview.todayExpenses,
    };
  }

  async loadMonthMovement(
    businessId: number,
    month: number,
    token: string,
    branchId?: number,
  ): Promise<FinanceMonthMovementViewModel> {
    return this.service.getMonthMovement(businessId, month, token, branchId);
  }

  async loadTodayMovement(
    businessId: number,
    token: string,
    branchId?: number,
  ): Promise<FinanceMonthMovementViewModel> {
    return this.service.getTodayMovement(businessId, token, branchId);
  }

  async createIncome(
    input: CreateFinanceEntryInput,
    token: string,
    branchId?: number,
  ): Promise<FinanceEntry> {
    return this.service.registerIncome(input, token, branchId);
  }

  async createExpense(
    input: CreateFinanceEntryInput,
    token: string,
    branchId?: number,
  ): Promise<FinanceEntry> {
    return this.service.registerExpense(input, token, branchId);
  }
}
