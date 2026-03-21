import assert from "node:assert/strict";
import { PosFinanceApi } from "../../../../src/new/systems/pos/features/finance/api/PosFinanceApi";

export async function run(): Promise<void> {
  const calls: Array<{ method: string; path: string; body?: unknown }> = [];

  const httpClient = {
    request: async ({ method, path, body }: { method: string; path: string; body?: unknown }) => {
      calls.push({ method, path, body });

      if (method === "GET" && path === "income/month/22") return { Income: "1300.50" };
      if (method === "GET" && path === "expenses/month/22") return 400;
      if (method === "GET" && path === "income/today/22") return { total: 200 };
      if (method === "GET" && path === "expenses/today/22") return "50";

      if (method === "POST" && path === "income/bymonth/22") {
        return { Incomes: [{ Name: "Venta", Amount: 500, CreatedAt: "2026-03-01T10:00:00Z" }] };
      }

      if (method === "POST" && path === "expenses/bymonth/22") {
        return { data: [{ Description: "Renta", Amount: 300, CreatedAt: "2026-03-02T10:00:00Z" }] };
      }

      if (method === "POST" && path === "income") {
        return { Name: "Venta", Amount: 100 };
      }

      if (method === "POST" && path === "expenses") {
        return { Name: "Renta", Amount: 50 };
      }

      throw new Error(`Unexpected call ${method} ${path}`);
    },
  };

  const api = new PosFinanceApi(httpClient as never);

  const overview = await api.getOverview(22, "token");
  assert.equal(overview.monthIncome, 1300.5);
  assert.equal(overview.monthExpenses, 400);
  assert.equal(overview.todayIncome, 200);
  assert.equal(overview.todayExpenses, 50);

  const incomes = await api.getIncomeByMonth(22, 2, "token");
  const expenses = await api.getExpensesByMonth(22, 2, "token");

  assert.equal(incomes.length, 1);
  assert.equal(incomes[0].name, "Venta");
  assert.equal(expenses.length, 1);
  assert.equal(expenses[0].name, "Renta");

  await api.createIncome({ businessId: 22, name: "venta", amount: 100 }, "token");
  await api.createExpense({ businessId: 22, name: "renta", amount: 50 }, "token");

  assert.deepEqual(
    calls.map((call) => `${call.method} ${call.path}`),
    [
      "GET income/month/22",
      "GET expenses/month/22",
      "GET income/today/22",
      "GET expenses/today/22",
      "POST income/bymonth/22",
      "POST expenses/bymonth/22",
      "POST income",
      "POST expenses",
    ],
  );
}
