import { CashClosing, CreateCashClosingDto } from "../model/CashClosing";

export interface EmployeeSummary {
  id: number;
  fullName: string;
}

export interface ICashClosingRepository {
  listEmployeesByBusiness(businessId: number, token: string): Promise<EmployeeSummary[]>;
  listByEmployee(employeeId: number, token: string): Promise<CashClosing[]>;
  getCurrentTotalByEmployee(employeeId: number, token: string): Promise<number>;
  create(payload: CreateCashClosingDto, token: string): Promise<void>;
}
