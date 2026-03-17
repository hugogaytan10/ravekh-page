import { HttpClient } from "../../../../core/api/HttpClient";
import { IFinanceRepository } from "../interface/IFinanceRepository";
import { CreateFinanceEntryInput, FinanceEntry, FinanceOverview } from "../model/FinanceEntry";

type FinanceEntryResponse = { Name?: string; Amount?: number; CreatedAt?: string; name?: string; amount?: number; createdAt?: string };

export class PosFinanceApi implements IFinanceRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getOverview(businessId: number, token: string): Promise<FinanceOverview> {
    const [monthIncome, monthExpenses, todayIncome, todayExpenses] = await Promise.all([
      this.httpClient.get<number>(`income/month/${businessId}`, token),
      this.httpClient.get<number>(`expenses/month/${businessId}`, token),
      this.httpClient.get<number>(`income/today/${businessId}`, token),
      this.httpClient.get<number>(`expenses/today/${businessId}`, token),
    ]);

    return new FinanceOverview(Number(monthIncome ?? 0), Number(monthExpenses ?? 0), Number(todayIncome ?? 0), Number(todayExpenses ?? 0));
  }

  async getIncomeByMonth(businessId: number, month: number, token: string): Promise<FinanceEntry[]> {
    const payload = await this.httpClient.post<FinanceEntryResponse[]>(`income/bymonth/${businessId}`, { month: month + 1 }, token);
    return this.mapEntries(payload);
  }

  async getExpensesByMonth(businessId: number, month: number, token: string): Promise<FinanceEntry[]> {
    const payload = await this.httpClient.post<FinanceEntryResponse[]>(`expenses/bymonth/${businessId}`, { month: month + 1 }, token);
    return this.mapEntries(payload);
  }

  async createIncome(input: CreateFinanceEntryInput, token: string): Promise<FinanceEntry> {
    const payload = await this.httpClient.post<FinanceEntryResponse>("income", this.mapCreatePayload(input), token);
    return this.mapEntry(payload, input.name, input.amount);
  }

  async createExpense(input: CreateFinanceEntryInput, token: string): Promise<FinanceEntry> {
    const payload = await this.httpClient.post<FinanceEntryResponse>("expenses", this.mapCreatePayload(input), token);
    return this.mapEntry(payload, input.name, input.amount);
  }

  private mapCreatePayload(input: CreateFinanceEntryInput): Record<string, unknown> {
    return {
      Business_Id: input.businessId,
      Name: input.name.toUpperCase(),
      Amount: input.amount,
    };
  }

  private mapEntries(payload: FinanceEntryResponse[] = []): FinanceEntry[] {
    return payload.map((entry) => this.mapEntry(entry));
  }

  private mapEntry(payload: FinanceEntryResponse = {}, fallbackName = "", fallbackAmount = 0): FinanceEntry {
    return new FinanceEntry(
      payload.name ?? payload.Name ?? fallbackName,
      Number(payload.amount ?? payload.Amount ?? fallbackAmount),
      payload.createdAt ?? payload.CreatedAt,
    );
  }
}
