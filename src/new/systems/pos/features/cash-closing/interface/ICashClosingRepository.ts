import { CashClosing, CashClosingPreview, CreateCashClosingDto } from "../model/CashClosing";

export interface EmployeeSummary {
  id: number;
  fullName: string;
}

export interface ICashClosingRepository {
  listEmployeesByBusiness(businessId: number, token: string): Promise<EmployeeSummary[]>;
  listByEmployee(employeeId: number, token: string): Promise<CashClosing[]>;
  getCurrentPreviewByEmployee(employeeId: number, token: string): Promise<CashClosingPreview>;
  create(payload: CreateCashClosingDto, token: string): Promise<void>;
}
