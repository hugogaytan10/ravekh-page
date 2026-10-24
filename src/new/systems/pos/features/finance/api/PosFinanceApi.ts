import { HttpClient } from "../../../../../core/api/HttpClient";
import { IFinanceRepository } from "../interface/IFinanceRepository";
import { CreateFinanceEntryInput, FinanceEntry, FinanceOverview } from "../model/FinanceEntry";

type FinanceEntryResponse = {
  Id?: number;
  Branch_Id?: number;
  Name?: string;
  Amount?: number | string;
  Date?: string;
  MoneyTipe?: string;
  Source?: string;
  Order_Id?: number | null;
  Command_Id?: number | null;
};

type ListWrapper = { data?: FinanceEntryResponse[] };
type SummaryRow = { MoneyTipe?: string; income?: number; expenses?: number; net?: number };
type SummaryResponse = { data?: { currencies?: SummaryRow[] } } | { currencies?: SummaryRow[] };

const isoDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const monthRange = (month: number) => {
  const now = new Date();
  const from = new Date(now.getFullYear(), month, 1);
  const to = new Date(now.getFullYear(), month + 1, 0);
  return { from: isoDate(from), to: isoDate(to) };
};

const todayRange = () => {
  const today = isoDate(new Date());
  return { from: today, to: today };
};

const toFinanceEntry = (row: FinanceEntryResponse, fallbackName = ""): FinanceEntry =>
  new FinanceEntry(
    String(row.Name ?? fallbackName).trim(),
    Number(row.Amount ?? 0),
    row.Date,
    Number(row.Id ?? 0) || undefined,
    row.Source ? String(row.Source).trim().toUpperCase() : undefined,
    row.Order_Id == null ? null : Number(row.Order_Id),
    row.Command_Id == null ? null : Number(row.Command_Id),
    Number(row.Branch_Id ?? 0) || undefined,
    row.MoneyTipe ? String(row.MoneyTipe).trim().toUpperCase() : undefined,
  );

export class PosFinanceApi implements IFinanceRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getOverview(_businessId: number, token: string, branchId?: number): Promise<FinanceOverview> {
    const now = new Date();
    const month = monthRange(now.getMonth());
    const today = todayRange();

    const [monthSummary, todaySummary] = await Promise.all([
      this.summary(month.from, month.to, token, branchId),
      this.summary(today.from, today.to, token, branchId),
    ]);

    return new FinanceOverview(
      monthSummary.income,
      monthSummary.expenses,
      todaySummary.income,
      todaySummary.expenses,
    );
  }

  async getIncomeByMonth(
    _businessId: number,
    month: number,
    token: string,
    branchId?: number,
  ): Promise<FinanceEntry[]> {
    const range = monthRange(month);
    return this.list("income", range.from, range.to, token, branchId);
  }

  async getIncomeToday(_businessId: number, token: string, branchId?: number): Promise<FinanceEntry[]> {
    const range = todayRange();
    return this.list("income", range.from, range.to, token, branchId);
  }

  async getExpensesByMonth(
    _businessId: number,
    month: number,
    token: string,
    branchId?: number,
  ): Promise<FinanceEntry[]> {
    const range = monthRange(month);
    return this.list("expenses", range.from, range.to, token, branchId);
  }

  async getExpensesToday(_businessId: number, token: string, branchId?: number): Promise<FinanceEntry[]> {
    const range = todayRange();
    return this.list("expenses", range.from, range.to, token, branchId);
  }

  async createIncome(
    input: CreateFinanceEntryInput,
    token: string,
    branchId?: number,
  ): Promise<FinanceEntry> {
    const response = await this.httpClient.request<{ data?: FinanceEntryResponse } | FinanceEntryResponse>({
      method: "POST",
      path: "finances/branch/income/manual",
      token,
      branchId,
      body: {
        Name: input.name.toUpperCase(),
        Amount: input.amount,
        MoneyTipe: "MXN",
      },
    });

    const row = "data" in response ? response.data ?? {} : response;
    return toFinanceEntry(
      {
        ...row,
        Name: row.Name ?? input.name,
        Amount: row.Amount ?? input.amount,
        Branch_Id: row.Branch_Id ?? branchId,
      },
      input.name,
    );
  }

  async createExpense(
    input: CreateFinanceEntryInput,
    token: string,
    branchId?: number,
  ): Promise<FinanceEntry> {
    const response = await this.httpClient.request<{ data?: FinanceEntryResponse } | FinanceEntryResponse>({
      method: "POST",
      path: "finances/branch/expenses",
      token,
      branchId,
      body: {
        Name: input.name.toUpperCase(),
        Amount: input.amount,
        MoneyTipe: "MXN",
      },
    });

    const row = "data" in response ? response.data ?? {} : response;
    return toFinanceEntry(
      {
        ...row,
        Name: row.Name ?? input.name,
        Amount: row.Amount ?? input.amount,
        Branch_Id: row.Branch_Id ?? branchId,
      },
      input.name,
    );
  }

  private async list(
    kind: "income" | "expenses",
    from: string,
    to: string,
    token: string,
    branchId?: number,
  ): Promise<FinanceEntry[]> {
    const response = await this.httpClient.request<ListWrapper | FinanceEntryResponse[]>({
      method: "GET",
      path: `finances/branch/${kind}`,
      token,
      branchId,
      query: { from, to },
    });

    const rows = Array.isArray(response) ? response : response.data ?? [];
    return rows.map((row) => toFinanceEntry(row));
  }

  private async summary(
    from: string,
    to: string,
    token: string,
    branchId?: number,
  ): Promise<{ income: number; expenses: number }> {
    const response = await this.httpClient.request<SummaryResponse>({
      method: "GET",
      path: "finances/branch/summary",
      token,
      branchId,
      query: { from, to },
    });

    const data = "data" in response ? response.data ?? {} : response;
    const rows = data.currencies ?? [];
    const mxn = rows.find((row) => String(row.MoneyTipe ?? "").toUpperCase() === "MXN") ?? rows[0];

    return {
      income: Number(mxn?.income ?? 0),
      expenses: Number(mxn?.expenses ?? 0),
    };
  }
}
