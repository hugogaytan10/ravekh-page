import { IEmployeeRepository } from "../interface/IEmployeeRepository";
import { Employee, UpsertEmployeeDto } from "../model/Employee";

export class EmployeeService {
  constructor(private readonly repository: IEmployeeRepository) {}

  async listEmployees(businessId: number, token: string, searchTerm = ""): Promise<Employee[]> {
    const employees = await this.repository.listByBusiness(businessId, token);
    if (!searchTerm) {
      return employees;
    }

    return employees.filter((employee) => employee.matches(searchTerm));
  }

  async getEmployeeDetail(employeeId: number, token: string): Promise<Employee> {
    return this.repository.getById(employeeId, token);
  }

  async saveEmployee(token: string, payload: UpsertEmployeeDto, employeeId?: number): Promise<Employee> {
    if (employeeId) {
      return this.repository.update(employeeId, payload, token);
    }

    return this.repository.create(payload, token);
  }

  async removeEmployee(employeeId: number, token: string): Promise<void> {
    await this.repository.delete(employeeId, token);
  }
}
