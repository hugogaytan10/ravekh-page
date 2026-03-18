import type { Employee } from "../model/Employee";

export class EmployeeMapper {
  static fromLegacy(payload: Record<string, unknown>): Employee {
    return {
      id: Number(payload.Id ?? 0),
      businessId: Number(payload.Business_Id ?? 0),
      name: String(payload.Name ?? ""),
      email: String(payload.Email ?? ""),
      role: payload.Role ? String(payload.Role) : undefined,
    };
  }

  static toLegacy(payload: Partial<Employee>): Record<string, unknown> {
    return {
      Name: payload.name,
      Email: payload.email,
      Role: payload.role,
    };
  }
}
