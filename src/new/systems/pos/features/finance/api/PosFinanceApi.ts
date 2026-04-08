import { HttpClient } from "../../../../core/api/HttpClient";
import { IFinanceRepository } from "../interface/IFinanceRepository";
import { CreateFinanceEntryInput, FinanceEntry, FinanceOverview } from "../model/FinanceEntry";

type FinanceEntryResponse = {
  Name?: string;
  Amount?: number | string;
  Date?: string;
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
  Incomes?: FinanceEntryResponse[] | FinanceEntryResponse;
  Expenses?: FinanceEntryResponse[] | FinanceEntryResponse;
  Income?: FinanceEntryResponse[] | FinanceEntryResponse;
  Expense?: FinanceEntryResponse[] | FinanceEntryResponse;
  incomes?: FinanceEntryResponse[] | FinanceEntryResponse;
  expenses?: FinanceEntryResponse[] | FinanceEntryResponse;
  income?: FinanceEntryResponse[] | FinanceEntryResponse;
  expense?: FinanceEntryResponse[] | FinanceEntryResponse;
  data?: unknown;
  Data?: unknown;
  result?: unknown;
  Result?: unknown;
  payload?: unknown;
  Payload?: unknown;
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

  private extractRows(payload: unknown, type: "income" | "expense"): FinanceEntryResponse[] {
    if (Array.isArray(payload)) {
      return payload as FinanceEntryResponse[];
    }

    if (!payload || typeof payload !== "object") {
      return [];
    }

    const record = payload as Record<string, unknown>;

    const typedCandidates = type === "income"
      ? [record.Incomes, record.Income, record.incomes, record.income]
      : [record.Expenses, record.Expense, record.expenses, record.expense];

    for (const candidate of typedCandidates) {
      if (Array.isArray(candidate)) return candidate as FinanceEntryResponse[];
      if (this.isFinanceEntryLike(candidate)) return [candidate as FinanceEntryResponse];
    }

    const wrappers = [record.data, record.Data, record.result, record.Result, record.payload, record.Payload];
    for (const wrapped of wrappers) {
      const extracted = this.extractRows(wrapped, type);
      if (extracted.length > 0) {
        return extracted;
      }
    }

    const firstArray = Object.values(record).find((value) => Array.isArray(value));
    if (Array.isArray(firstArray)) {
      return firstArray as FinanceEntryResponse[];
    }

    if (this.isFinanceEntryLike(record)) {
      return [record as FinanceEntryResponse];
    }

    return [];
  }

  private isFinanceEntryLike(value: unknown): boolean {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;

    const row = value as Record<string, unknown>;
    return ["Name", "name", "Description", "Amount", "amount", "Date", "date", "CreatedAt", "createdAt", "Created_At", "created_at", "Created"]
      .some((key) => row[key] !== undefined);
  }

  private mapEntry(payload: FinanceEntryResponse = {}, fallbackName = "", fallbackAmount = 0): FinanceEntry {
    return new FinanceEntry(
      String(payload.name ?? payload.Name ?? payload.Description ?? fallbackName ?? "").trim(),
      this.toSafeAmount(payload.amount ?? payload.Amount ?? fallbackAmount),
      payload.createdAt ?? payload.CreatedAt ?? payload.created_at ?? payload.Created_At ?? payload.date ?? payload.Date ?? payload.Created,
    );
  }

  private extractAmount(value: unknown): number {
    if (typeof value === "number") return this.toSafeAmount(value);
    if (typeof value === "string") return this.toSafeAmount(value);

    if (Array.isArray(value)) {
      return value.reduce((accumulator, row) => accumulator + this.extractAmount(row), 0);
    }

    if (value && typeof value === "object") {
      const objectValue = value as Record<string, unknown>;
      const candidates = [
        "Amount", "amount",
        "Income", "income", "Incomes", "incomes",
        "Expenses", "expenses", "Expense", "expense",
        "total", "Total",
      ] as const;

      for (const key of candidates) {
        const raw = objectValue[key];
        if (raw !== undefined) {
          return this.extractAmount(raw);
        }
      }

      const wrappers = [
        objectValue.TotalsByCurrency,
        objectValue.totalsByCurrency,
        objectValue.data,
        objectValue.Data,
        objectValue.result,
        objectValue.Result,
        objectValue.payload,
        objectValue.Payload,
      ];

      for (const wrapped of wrappers) {
        if (wrapped !== undefined) {
          const amount = this.extractAmount(wrapped);
          if (amount !== 0) return amount;
        }
      }
    }

    return 0;
  }

  private toSafeAmount(value: unknown): number {
    const amount = Number(value ?? 0);
    return Number.isFinite(amount) ? amount : 0;
  }
}
