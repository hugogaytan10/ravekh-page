import { CashClosingService } from "../services/CashClosingService";

export interface CashClosingViewModel {
  id: number;
  employeeId: number;
  expectedAmount: number;
  countedAmount: number;
  difference: number;
  balanced: boolean;
}

export class CashClosingPage {
  constructor(private readonly service: CashClosingService) {}

  async loadCurrent(employeeId: number, token: string): Promise<CashClosingViewModel | null> {
    const closing = await this.service.getCurrentClosing(employeeId, token);

    if (!closing) {
      return null;
    }

    return {
      id: closing.id,
      employeeId: closing.employeeId,
      expectedAmount: closing.expectedAmount,
      countedAmount: closing.countedAmount,
      difference: closing.difference,
      balanced: closing.isBalanced(),
    };
  }
}
