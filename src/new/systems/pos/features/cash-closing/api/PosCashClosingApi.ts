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
  Employees_Id: number;
  OpeningAmount?: number;
  ExpectedAmount?: number;
  CountedAmount?: number;
  Difference?: number;
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

  async getCurrentByEmployee(employeeId: number, token: string): Promise<CashClosing | null> {
    const response = await this.httpClient.request<CashClosingResponse | null>({
      method: "GET",
      path: `cashclosing/total/${employeeId}`,
      token,
    });

    if (!response) {
      return null;
    }

    return this.toDomain(response);
  }

  async create(payload: CreateCashClosingDto, token: string): Promise<CashClosing> {
    const response = await this.httpClient.request<CashClosingResponse>({
      method: "POST",
      path: "cashclosing",
      token,
      body: {
        Employees_Id: payload.employeeId,
        OpeningAmount: payload.openingAmount,
        ExpectedAmount: payload.expectedAmount,
        CountedAmount: payload.countedAmount,
      },
    });

    return this.toDomain(response);
  }

  private toDomain(response: CashClosingResponse): CashClosing {
    return new CashClosing(
      response.Id,
      response.Employees_Id,
      response.OpeningAmount ?? 0,
      response.ExpectedAmount ?? 0,
      response.CountedAmount ?? 0,
      response.Difference ?? 0,
    );
  }
}
