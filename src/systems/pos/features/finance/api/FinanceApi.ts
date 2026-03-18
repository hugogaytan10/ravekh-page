import { HttpClient } from "../../../../shared/api/HttpClient";
import { fail, ok, type Result } from "../../../../shared/models/Result";
import type { FinanceGateway } from "../interfaces/FinanceContracts";
import type { FinanceRecord, FinanceRecordType } from "../models/FinanceRecord";
import { FinanceMapper } from "./FinanceMapper";

const routeByType: Record<FinanceRecordType, string> = {
  INCOME: "income",
  EXPENSE: "expenses",
};

export class FinanceApi implements FinanceGateway {
  constructor(private readonly httpClient: HttpClient) {}

  async listByMonth(token: string, businessId: string, type: FinanceRecordType, month: number): Promise<FinanceRecord[]> {
    const route = routeByType[type];
    const data = await this.httpClient.request<unknown[]>(`${route}/bymonth/${businessId}`, {
      method: "POST",
      token,
      body: { month: month + 1 },
    });

    return (Array.isArray(data) ? data : []).map((item) =>
      FinanceMapper.fromLegacy(item as Record<string, unknown>, type),
    );
  }

  async listToday(token: string, businessId: string, type: FinanceRecordType): Promise<FinanceRecord[]> {
    const route = routeByType[type];
    const data = await this.httpClient.request<unknown[]>(`${route}/today/${businessId}`, { token });

    return (Array.isArray(data) ? data : []).map((item) =>
      FinanceMapper.fromLegacy(item as Record<string, unknown>, type),
    );
  }

  async create(token: string, record: FinanceRecord): Promise<Result<FinanceRecord>> {
    const route = routeByType[record.type];

    try {
      await this.httpClient.request(route, {
        method: "POST",
        token,
        body: FinanceMapper.toLegacy(record),
      });

      return ok(record, `${record.type} record created successfully.`);
    } catch (error) {
      return fail(
        `Failed to create ${record.type.toLowerCase()} record.`,
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  }
}
