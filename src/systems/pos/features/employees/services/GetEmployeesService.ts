import type { IEmployeeRepository } from "../interface/IEmployeeRepository";
import type { Employee, EmployeeSearchFilters } from "../model/Employee";

export class GetEmployeesService {
  constructor(private readonly employeeRepository: IEmployeeRepository) {}

  async execute(businessId: number, filters: EmployeeSearchFilters = {}): Promise<Employee[]> {
    const employees = await this.employeeRepository.listByBusinessId(businessId);

    const excluded = new Set(filters.excludeIds ?? []);
    const normalizedQuery = (filters.query ?? "").trim().toLowerCase();

    return employees.filter((employee) => {
      if (excluded.has(employee.id)) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return (
        employee.name.toLowerCase().includes(normalizedQuery) ||
        employee.email.toLowerCase().includes(normalizedQuery)
      );
    });
  }
}
