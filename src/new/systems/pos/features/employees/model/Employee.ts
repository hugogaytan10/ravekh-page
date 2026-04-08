export type EmployeeRole = "admin" | "manager" | "cashier" | "staff";

export class Employee {
  constructor(
    public readonly id: number,
    public readonly businessId: number,
    public readonly name: string,
    public readonly email: string,
    public readonly role: EmployeeRole,
    public readonly isActive: boolean,
  ) {}

  canAccessFinancialData(): boolean {
    return this.role === "admin" || this.role === "manager";
  }

  matches(searchTerm: string): boolean {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) {
      return true;
    }

    return `${this.name} ${this.email} ${this.role}`.toLowerCase().includes(normalized);
  }
}

export interface UpsertEmployeeDto {
  businessId: number;
  name: string;
  email: string;
  role: EmployeeRole;
  isActive?: boolean;
  password?: string;
  pin?: string;
}
