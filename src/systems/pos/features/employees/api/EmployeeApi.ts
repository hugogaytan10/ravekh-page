import type { IEmployeeRepository } from "../interface/IEmployeeRepository";
import type { Employee } from "../model/Employee";
import { EmployeeMapper } from "./EmployeeMapper";

export interface EmployeeApiConfig {
  baseUrl: string;
  token?: string;
}

export class EmployeeApi implements IEmployeeRepository {
  constructor(private readonly config: EmployeeApiConfig) {}

  async listByBusinessId(businessId: number): Promise<Employee[]> {
    const data = await this.request<unknown[]>(`employee/business/${businessId}`);
    return (Array.isArray(data) ? data : []).map((item) => EmployeeMapper.fromLegacy(item as Record<string, unknown>));
  }

  async getById(employeeId: number): Promise<Employee | null> {
    const data = await this.request<unknown>(`employee/${employeeId}`);
    if (!data || typeof data !== "object") {
      return null;
    }
    return EmployeeMapper.fromLegacy(data as Record<string, unknown>);
  }

  async update(employeeId: number, payload: Partial<Employee>): Promise<boolean> {
    await this.request(`employee/${employeeId}`, {
      method: "PUT",
      body: EmployeeMapper.toLegacy(payload),
    });

    return true;
  }

  async remove(employeeId: number): Promise<boolean> {
    await this.request(`employee/${employeeId}`, {
      method: "DELETE",
    });

    return true;
  }

  private async request<TResponse>(path: string, init: RequestInit & { body?: unknown } = {}): Promise<TResponse> {
    const { body, headers, ...rest } = init;
    const response = await fetch(`${this.config.baseUrl}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(this.config.token ? { token: this.config.token } : {}),
        ...(headers ?? {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Employee API request failed with status ${response.status}`);
    }

    if (response.status === 204) {
      return null as TResponse;
    }

    return (await response.json()) as TResponse;
  }
}
