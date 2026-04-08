import { HttpClient } from "../../../../core/api/HttpClient";
import { EmployeeSummary, ICashClosingRepository } from "../interface/ICashClosingRepository";
import { CashClosing, CreateCashClosingDto } from "../model/CashClosing";

type EmployeeResponse = {
  Id: number;
  Name: string;
  LastName?: string;
};

type CashClosingResponse = {
  Id: number;
  Employee_Id?: number;
  Employees_Id?: number;
  Total?: number;
  Date?: string;
  Employee_Name?: string;
};

export class PosCashClosingApi implements ICashClosingRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async listEmployeesByBusiness(businessId: number, token: string): Promise<EmployeeSummary[]> {
    const response = await this.httpClient.request<EmployeeResponse[]>({
      method: "GET",
      path: `employee/business/${businessId}`,
      token,
    });

    return response.map((employee) => ({
      id: employee.Id,
      fullName: `${employee.Name} ${employee.LastName ?? ""}`.trim(),
    }));
  }

  async listByEmployee(employeeId: number, token: string): Promise<CashClosing[]> {
    const response = await this.httpClient.request<CashClosingResponse[]>({
      method: "GET",
      path: `cashclosing/employee/${employeeId}`,
      token,
    });

    return response.map((closing) => this.toDomain(closing));
  }

  async getCurrentTotalByEmployee(employeeId: number, token: string): Promise<number> {
    const response = await this.httpClient.request<number | { total?: number } | null>({
      method: "GET",
      path: `cashclosing/total/${employeeId}`,
      token,
    });

    if (typeof response === "number") return response;
    if (response && typeof response.total === "number") return response.total;
    return 0;
  }

  async create(payload: CreateCashClosingDto, token: string): Promise<void> {
    await this.httpClient.request<unknown>({
      method: "POST",
      path: "cashclosing",
      token,
      body: {
        Employee_Id: payload.employeeId,
      },
    });
  }

  private toDomain(response: CashClosingResponse): CashClosing {
    const employeeId = response.Employee_Id ?? response.Employees_Id ?? 0;
    return new CashClosing(
      response.Id,
      employeeId,
      response.Total ?? 0,
      response.Date ?? "",
      response.Employee_Name ?? "",
    );
  }
}
