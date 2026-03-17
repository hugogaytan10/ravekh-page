import { UpsertEmployeeDto } from "../model/Employee";
import { EmployeeService } from "../services/EmployeeService";

type EmployeeCardViewModel = {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  canAccessFinancialData: boolean;
};

export class EmployeeManagementPage {
  constructor(private readonly employeeService: EmployeeService) {}

  async getEmployeeCards(businessId: number, token: string, searchTerm = ""): Promise<EmployeeCardViewModel[]> {
    const employees = await this.employeeService.listEmployees(businessId, token, searchTerm);

    return employees.map((employee) => ({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      isActive: employee.isActive,
      canAccessFinancialData: employee.canAccessFinancialData(),
    }));
  }

  async upsertEmployee(token: string, payload: UpsertEmployeeDto, employeeId?: number): Promise<void> {
    await this.employeeService.saveEmployee(token, payload, employeeId);
  }

  async deleteEmployee(employeeId: number, token: string): Promise<void> {
    await this.employeeService.removeEmployee(employeeId, token);
  }
}
