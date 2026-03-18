import type { Employee } from "../model/Employee";

export interface IEmployeeRepository {
  listByBusinessId(businessId: number): Promise<Employee[]>;
  getById(employeeId: number): Promise<Employee | null>;
  update(employeeId: number, payload: Partial<Employee>): Promise<boolean>;
  remove(employeeId: number): Promise<boolean>;
}
