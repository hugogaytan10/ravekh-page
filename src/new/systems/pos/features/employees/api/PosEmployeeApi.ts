import { HttpClient } from "../../../../core/api/HttpClient";
import { IEmployeeRepository } from "../interface/IEmployeeRepository";
import { Employee, EmployeeRole, UpsertEmployeeDto } from "../model/Employee";

type EmployeeResponse = {
  Id?: number;
  id?: number;
  Business_Id?: number;
  businessId?: number;
  Name?: string;
  name?: string;
  Email?: string;
  email?: string;
  Role?: string | null;
  role?: string | null;
  IsActive?: number | boolean | null;
  isActive?: number | boolean | null;
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
    const response = await this.httpClient.request<EmployeeResponse | null>({
      method: "POST",
      path: "employee",
      token,
      body: this.toApiPayload(payload),
    });

    return this.toDomain(response, payload);
  }

  async update(employeeId: number, payload: UpsertEmployeeDto, token: string): Promise<Employee> {
    const response = await this.httpClient.request<EmployeeResponse | null>({
      method: "PUT",
      path: `employee/${employeeId}`,
      token,
      body: this.toApiPayload(payload),
    });

    return this.toDomain(response, payload, employeeId);
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
      Role: this.toApiRole(payload.role),
      Password: payload.password?.trim() ? payload.password.trim() : undefined,
      Pin: payload.pin?.trim() ? payload.pin.trim() : undefined,
    };
  }

  private toDomain(response: EmployeeResponse | null, fallback?: UpsertEmployeeDto, employeeIdFallback = 0): Employee {
    const id = Number(response?.Id ?? response?.id ?? employeeIdFallback);
    const businessId = Number(response?.Business_Id ?? response?.businessId ?? fallback?.businessId ?? 0);
    const name = (response?.Name ?? response?.name ?? fallback?.name ?? "").trim();
    const email = (response?.Email ?? response?.email ?? fallback?.email ?? "").trim();
    const role = this.toRole(response?.Role ?? response?.role ?? fallback?.role ?? "staff");
    const isActive = response?.IsActive ?? response?.isActive ?? fallback?.isActive ?? true;

    return new Employee(
      Number.isFinite(id) ? id : 0,
      Number.isFinite(businessId) ? businessId : 0,
      name,
      email,
      role,
      isActive === true || isActive === 1,
    );
  }

  private toRole(role: string | null): EmployeeRole {
    const normalized = (role ?? "staff").toLowerCase();

    if (normalized === "gerente" || normalized === "manager") {
      return "manager";
    }

    if (normalized === "admin" || normalized === "administrador") {
      return "manager";
    }

    if (normalized === "cashier" || normalized === "cajero") {
      return "staff";
    }

    return "staff";
  }

  private toApiRole(role: EmployeeRole): string {
    switch (role) {
      case "manager":
        return "GERENTE";
      case "admin":
        return "GERENTE";
      case "staff":
      case "cashier":
        return "AYUDANTE";
      default:
        return "AYUDANTE";
    }
  }
}
