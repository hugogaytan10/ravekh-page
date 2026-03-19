import { HttpClient } from "../../../../core/api/HttpClient";
import { IEmployeeRepository } from "../interface/IEmployeeRepository";
import { Employee, EmployeeRole, UpsertEmployeeDto } from "../model/Employee";

type EmployeeResponse = {
  Id: number;
  Business_Id: number;
  Name: string;
  Email: string;
  Role: string | null;
  IsActive: number | boolean | null;
};

export class PosEmployeeApi implements IEmployeeRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async listByBusiness(businessId: number, token: string): Promise<Employee[]> {
    const response = await this.httpClient.request<EmployeeResponse[]>({
      method: "GET",
      path: `employee/business/${businessId}`,
      token,
    });

    return response.map((item) => this.toDomain(item));
  }

  async getById(employeeId: number, token: string): Promise<Employee> {
    const response = await this.httpClient.request<EmployeeResponse>({
      method: "GET",
      path: `employee/${employeeId}`,
      token,
    });

    return this.toDomain(response);
  }

  async create(payload: UpsertEmployeeDto, token: string): Promise<Employee> {
    const response = await this.httpClient.request<EmployeeResponse>({
      method: "POST",
      path: "employee",
      token,
      body: this.toApiPayload(payload),
    });

    return this.toDomain(response);
  }

  async update(employeeId: number, payload: UpsertEmployeeDto, token: string): Promise<Employee> {
    const response = await this.httpClient.request<EmployeeResponse>({
      method: "PUT",
      path: `employee/${employeeId}`,
      token,
      body: this.toApiPayload(payload),
    });

    return this.toDomain(response);
  }

  async delete(employeeId: number, token: string): Promise<void> {
    await this.httpClient.request<void>({
      method: "DELETE",
      path: `employee/${employeeId}`,
      token,
    });
  }

  private toApiPayload(payload: UpsertEmployeeDto): Record<string, unknown> {
    return {
      Business_Id: payload.businessId,
      Name: payload.name,
      Email: payload.email,
      Role: payload.role,
      IsActive: payload.isActive ?? true,
    };
  }

  private toDomain(response: EmployeeResponse): Employee {
    return new Employee(
      response.Id,
      response.Business_Id,
      response.Name,
      response.Email,
      this.toRole(response.Role),
      response.IsActive === true || response.IsActive === 1,
    );
  }

  private toRole(role: string | null): EmployeeRole {
    const normalized = (role ?? "staff").toLowerCase();
    if (normalized === "admin" || normalized === "manager" || normalized === "cashier") {
      return normalized;
    }

    return "staff";
  }
}
