import type { IEmployeeRepository } from "../interface/IEmployeeRepository";
import type { Employee } from "../model/Employee";

export class ManageEmployeeService {
  constructor(private readonly employeeRepository: IEmployeeRepository) {}

  update(employeeId: number, payload: Partial<Employee>): Promise<boolean> {
    return this.employeeRepository.update(employeeId, payload);
  }

  remove(employeeId: number): Promise<boolean> {
    return this.employeeRepository.remove(employeeId);
  }
}
