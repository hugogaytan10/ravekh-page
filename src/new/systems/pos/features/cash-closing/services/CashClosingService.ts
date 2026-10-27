import { EmployeeSummary, ICashClosingRepository } from "../interface/ICashClosingRepository";
import { CashClosing, CashClosingPreview, CreateCashClosingDto } from "../model/CashClosing";

export class CashClosingService {
  constructor(private readonly repository: ICashClosingRepository) {}

  async listEmployees(businessId: number, token: string): Promise<EmployeeSummary[]> {
    return this.repository.listEmployeesByBusiness(businessId, token);
  }

  async listClosings(employeeId: number, token: string): Promise<CashClosing[]> {
    return this.repository.listByEmployee(employeeId, token);
  }

  async getCurrentTotal(employeeId: number, token: string): Promise<number> {
    return (await this.getCurrentPreview(employeeId, token)).total;
  }

  async getCurrentPreview(employeeId: number, token: string): Promise<CashClosingPreview> {
    return this.repository.getCurrentPreviewByEmployee(employeeId, token);
  }

  async registerClosing(payload: CreateCashClosingDto, token: string): Promise<void> {
    await this.repository.create(payload, token);
  }
}
