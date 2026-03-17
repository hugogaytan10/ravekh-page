import { CashClosing, CreateCashClosingDto } from "../model/CashClosing";

export interface EmployeeSummary {
  id: number;
  fullName: string;
}

export interface ICashClosingRepository {
  listEmployeesByBusiness(businessId: number, token: string): Promise<EmployeeSummary[]>;
  listByEmployee(employeeId: number, token: string): Promise<CashClosing[]>;
  getCurrentByEmployee(employeeId: number, token: string): Promise<CashClosing | null>;
  create(payload: CreateCashClosingDto, token: string): Promise<CashClosing>;
}
