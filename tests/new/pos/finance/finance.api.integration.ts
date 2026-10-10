import assert from "node:assert/strict";
import { PosFinanceApi } from "../../../../src/new/systems/pos/features/finance/api/PosFinanceApi";

export async function run(): Promise<void> {
  const calls: Array<{ method: string; path: string; body?: unknown; branchId?: number; query?: Record<string, unknown> }> = [];
  let summaryCalls = 0;

  const httpClient = {
    request: async ({ method, path, body, branchId, query }: { method: string; path: string; body?: unknown; branchId?: number; query?: Record<string, unknown> }) => {
      calls.push({ method, path, body, branchId, query });

      if (method === "GET" && path === "finances/branch/summary") {
        summaryCalls += 1;
        return {
          data: {
            currencies: [{ MoneyTipe: "MXN", income: summaryCalls === 1 ? 1300.5 : 200, expenses: summaryCalls === 1 ? 400 : 50 }],
          },
        };
      }
      if (method === "GET" && path === "finances/branch/income") {
        return { data: [{ Id: 1, Branch_Id: 5, Name: "Venta", Amount: 500, Date: "2026-03-01T10:00:00Z", MoneyTipe: "MXN" }] };
      }
      if (method === "GET" && path === "finances/branch/expenses") {
        return { data: [{ Id: 2, Branch_Id: 5, Name: "Renta", Amount: 300, Date: "2026-03-02T10:00:00Z", MoneyTipe: "MXN" }] };
      }
      if (method === "POST" && path === "finances/branch/income/manual") {
        return { data: { Id: 3, Name: "VENTA", Amount: 100, Branch_Id: 5, MoneyTipe: "MXN" } };
      }
      if (method === "POST" && path === "finances/branch/expenses") {
        return { data: { Id: 4, Name: "RENTA", Amount: 50, Branch_Id: 5, MoneyTipe: "MXN" } };
      }
      throw new Error(`Unexpected call ${method} ${path}`);
    },
  };

  const api = new PosFinanceApi(httpClient as never);
  const overview = await api.getOverview(22, "token", 5);
  assert.equal(overview.monthIncome, 1300.5);
  assert.equal(overview.monthExpenses, 400);
  assert.equal(overview.todayIncome, 200);
  assert.equal(overview.todayExpenses, 50);

  const todayIncomeEntries = await api.getIncomeToday(22, "token", 5);
  const todayExpenseEntries = await api.getExpensesToday(22, "token", 5);
  const incomes = await api.getIncomeByMonth(22, 2, "token", 5);
  const expenses = await api.getExpensesByMonth(22, 2, "token", 5);
  assert.equal(todayIncomeEntries[0]?.name, "Venta");
  assert.equal(todayExpenseEntries[0]?.name, "Renta");
  assert.equal(incomes[0]?.amount, 500);
  assert.equal(expenses[0]?.amount, 300);

  const income = await api.createIncome({ businessId: 22, name: "venta", amount: 100 }, "token", 5);
  const expense = await api.createExpense({ businessId: 22, name: "renta", amount: 50 }, "token", 5);
  assert.equal(income.name, "VENTA");
  assert.equal(expense.name, "RENTA");

  assert.deepEqual(
    calls.map((call) => `${call.method} ${call.path}`),
    [
      "GET finances/branch/summary",
      "GET finances/branch/summary",
      "GET finances/branch/income",
      "GET finances/branch/expenses",
      "GET finances/branch/income",
      "GET finances/branch/expenses",
      "POST finances/branch/income/manual",
      "POST finances/branch/expenses",
    ],
  );
  assert.ok(calls.every((call) => call.branchId === 5));
  assert.deepEqual(calls.at(-2)?.body, { Name: "VENTA", Amount: 100, MoneyTipe: "MXN" });
  assert.deepEqual(calls.at(-1)?.body, { Name: "RENTA", Amount: 50, MoneyTipe: "MXN" });
}
