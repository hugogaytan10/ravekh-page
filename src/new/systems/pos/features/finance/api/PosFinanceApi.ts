import { HttpClient } from "../../../../core/api/HttpClient";
import { IFinanceRepository } from "../interface/IFinanceRepository";
import { CreateFinanceEntryInput, FinanceEntry, FinanceOverview } from "../model/FinanceEntry";

type FinanceEntryResponse = {
  Name?: string;
  Amount?: number | string;
  CreatedAt?: string;
  Created_At?: string;
  Created?: string;
  name?: string;
  amount?: number | string;
  createdAt?: string;
  created_at?: string;
  date?: string;
  Description?: string;
};

type LegacyListResponse = {
  Incomes?: FinanceEntryResponse[];
  Expenses?: FinanceEntryResponse[];
  Income?: FinanceEntryResponse[];
  Expense?: FinanceEntryResponse[];
  data?: FinanceEntryResponse[];
};

export class PosFinanceApi implements IFinanceRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getOverview(businessId: number, token: string): Promise<FinanceOverview> {
    const [monthIncome, monthExpenses, todayIncome, todayExpenses] = await Promise.all([
      this.httpClient.request<unknown>({ method: "GET", path: `income/month/${businessId}`, token }),
      this.httpClient.request<unknown>({ method: "GET", path: `expenses/month/${businessId}`, token }),
      this.httpClient.request<unknown>({ method: "GET", path: `income/today/${businessId}`, token }),
      this.httpClient.request<unknown>({ method: "GET", path: `expenses/today/${businessId}`, token }),
    ]);

    return new FinanceOverview(
      this.extractAmount(monthIncome),
      this.extractAmount(monthExpenses),
      this.extractAmount(todayIncome),
      this.extractAmount(todayExpenses),
    );
  }

  async getIncomeByMonth(businessId: number, month: number, token: string): Promise<FinanceEntry[]> {
    const payload = await this.httpClient.request<FinanceEntryResponse[] | LegacyListResponse>({
      method: "POST",
      path: `income/bymonth/${businessId}`,
      body: { month: month + 1 },
      token,
    });
    return this.mapEntries(payload, "income");
  }

  async getIncomeToday(businessId: number, token: string): Promise<FinanceEntry[]> {
    const payload = await this.httpClient.request<FinanceEntryResponse[] | LegacyListResponse>({
      method: "GET",
      path: `income/today/${businessId}`,
      token,
    });
    return this.mapEntries(payload, "income");
  }

  async getExpensesByMonth(businessId: number, month: number, token: string): Promise<FinanceEntry[]> {
    const payload = await this.httpClient.request<FinanceEntryResponse[] | LegacyListResponse>({
      method: "POST",
      path: `expenses/bymonth/${businessId}`,
      body: { month: month + 1 },
      token,
    });
    return this.mapEntries(payload, "expense");
  }

  async getExpensesToday(businessId: number, token: string): Promise<FinanceEntry[]> {
    const payload = await this.httpClient.request<FinanceEntryResponse[] | LegacyListResponse>({
      method: "GET",
      path: `expenses/today/${businessId}`,
      token,
    });
    return this.mapEntries(payload, "expense");
  }

  async createIncome(input: CreateFinanceEntryInput, token: string): Promise<FinanceEntry> {
    const payload = await this.httpClient.request<FinanceEntryResponse>({ method: "POST", path: "income", body: this.mapCreatePayload(input), token });
    return this.mapEntry(payload, input.name, input.amount);
  }

  async createExpense(input: CreateFinanceEntryInput, token: string): Promise<FinanceEntry> {
    const payload = await this.httpClient.request<FinanceEntryResponse>({ method: "POST", path: "expenses", body: this.mapCreatePayload(input), token });
    return this.mapEntry(payload, input.name, input.amount);
  }

  private mapCreatePayload(input: CreateFinanceEntryInput): Record<string, unknown> {
    return {
      Business_Id: input.businessId,
      Name: input.name.toUpperCase(),
      Amount: input.amount,
    };
  }

  private mapEntries(payload: FinanceEntryResponse[] | LegacyListResponse = [], type: "income" | "expense"): FinanceEntry[] {
    const rows = this.extractRows(payload, type);

    return rows
      .map((entry) => this.mapEntry(entry))
      .filter((entry) => entry.name.trim().length > 0 || entry.amount !== 0);
  }

  private extractRows(payload: FinanceEntryResponse[] | LegacyListResponse, type: "income" | "expense"): FinanceEntryResponse[] {
    if (Array.isArray(payload)) {
      return payload;
    }

    const typedRows = type === "income"
      ? payload.Incomes ?? payload.Income
      : payload.Expenses ?? payload.Expense;

    if (Array.isArray(typedRows)) {
      return typedRows;
    }

    if (Array.isArray(payload.data)) {
      return payload.data;
    }

    const genericFirstArray = Object.values(payload).find((value) => Array.isArray(value));
    return Array.isArray(genericFirstArray) ? genericFirstArray as FinanceEntryResponse[] : [];
  }

  private mapEntry(payload: FinanceEntryResponse = {}, fallbackName = "", fallbackAmount = 0): FinanceEntry {
    return new FinanceEntry(
      String(payload.name ?? payload.Name ?? payload.Description ?? fallbackName ?? "").trim(),
      this.toSafeAmount(payload.amount ?? payload.Amount ?? fallbackAmount),
      payload.createdAt ?? payload.CreatedAt ?? payload.created_at ?? payload.Created_At ?? payload.date ?? payload.Created,
    );
  }

  private extractAmount(value: unknown): number {
    if (typeof value === "number") return this.toSafeAmount(value);
    if (typeof value === "string") return this.toSafeAmount(value);
    if (Array.isArray(value)) {
      return value.reduce((accumulator, row) => accumulator + this.extractAmount(row), 0);
    }

    if (value && typeof value === "object") {
      const candidates = ["Amount", "amount", "Income", "income", "Expenses", "expenses", "total", "Total"] as const;
      for (const key of candidates) {
        const raw = (value as Record<string, unknown>)[key];
        if (raw !== undefined) {
          return this.extractAmount(raw);
        }
      }

      const totalsByCurrency = (value as Record<string, unknown>).TotalsByCurrency ?? (value as Record<string, unknown>).totalsByCurrency;
      if (totalsByCurrency !== undefined) {
        return this.extractAmount(totalsByCurrency);
      }
    }

    return 0;
  }

  private toSafeAmount(value: unknown): number {
    const amount = Number(value ?? 0);
    return Number.isFinite(amount) ? amount : 0;
  }
}
