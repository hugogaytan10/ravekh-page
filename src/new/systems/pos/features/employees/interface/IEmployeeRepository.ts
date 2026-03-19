import { Employee, UpsertEmployeeDto } from "../model/Employee";

export interface IEmployeeRepository {
  listByBusiness(businessId: number, token: string): Promise<Employee[]>;
  getById(employeeId: number, token: string): Promise<Employee>;
  create(payload: UpsertEmployeeDto, token: string): Promise<Employee>;
  update(employeeId: number, payload: UpsertEmployeeDto, token: string): Promise<Employee>;
  delete(employeeId: number, token: string): Promise<void>;
}
