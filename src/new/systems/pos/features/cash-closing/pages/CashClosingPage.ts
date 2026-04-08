import { CashClosingService } from "../services/CashClosingService";
import { CreateCashClosingDto } from "../model/CashClosing";

export interface CashClosingViewModel {
  id: number;
  employeeId: number;
  total: number;
  date: string;
  employeeName: string;
}

export class CashClosingPage {
  constructor(private readonly service: CashClosingService) {}

  async listEmployees(businessId: number, token: string): Promise<Array<{ id: number; fullName: string }>> {
    return this.service.listEmployees(businessId, token);
  }

  async listByEmployee(employeeId: number, token: string): Promise<CashClosingViewModel[]> {
    const closings = await this.service.listClosings(employeeId, token);
    return closings.map((closing) => ({
      id: closing.id,
      employeeId: closing.employeeId,
      total: closing.total,
      date: closing.date,
      employeeName: closing.employeeName,
    }));
  }

  async loadCurrentTotal(employeeId: number, token: string): Promise<number> {
    return this.service.getCurrentTotal(employeeId, token);
  }

  // Backward-compatible adapter for preview module while UI v2 consumes loadCurrentTotal.
  async loadCurrent(employeeId: number, token: string): Promise<{
    id: number;
    employeeId: number;
    expectedAmount: number;
    countedAmount: number;
    difference: number;
    balanced: boolean;
  }> {
    const total = await this.loadCurrentTotal(employeeId, token);
    return {
      id: 0,
      employeeId,
      expectedAmount: total,
      countedAmount: total,
      difference: 0,
      balanced: true,
    };
  }

  async register(payload: CreateCashClosingDto, token: string): Promise<void> {
    await this.service.registerClosing(payload, token);
  }
}
