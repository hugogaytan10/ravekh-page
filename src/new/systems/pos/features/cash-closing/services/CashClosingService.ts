import { EmployeeSummary, ICashClosingRepository } from "../interface/ICashClosingRepository";
import { CashClosing, CreateCashClosingDto } from "../model/CashClosing";

export class CashClosingService {
  constructor(private readonly repository: ICashClosingRepository) {}

  async listEmployees(businessId: number, token: string): Promise<EmployeeSummary[]> {
    return this.repository.listEmployeesByBusiness(businessId, token);
  }

  async listClosings(employeeId: number, token: string): Promise<CashClosing[]> {
    return this.repository.listByEmployee(employeeId, token);
  }

  async getCurrentClosing(employeeId: number, token: string): Promise<CashClosing | null> {
    return this.repository.getCurrentByEmployee(employeeId, token);
  }

  async registerClosing(payload: CreateCashClosingDto, token: string): Promise<CashClosing> {
    return this.repository.create(payload, token);
  }
}
