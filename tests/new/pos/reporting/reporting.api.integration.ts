import assert from "node:assert/strict";
import { PosReportingApi } from "../../../../src/new/systems/pos/features/reporting/api/PosReportingApi";

export async function run(): Promise<void> {
  const calls: Array<{ method: string; path: string; branchId?: number; query?: Record<string, unknown> }> = [];
  const httpClient = {
    request: async ({ method, path, branchId, query }: { method: string; path: string; branchId?: number; query?: Record<string, unknown> }) => {
      calls.push({ method, path, branchId, query });
      if (method === "GET" && path === "reports/branch/overview") {
        return { data: { byCurrency: [{ MoneyTipe: "MXN", sales: 1000, transactions: 5, items: 8, cost: 400, estimatedGrossProfit: 600, averageTicket: 200 }] } };
      }
      if (method === "GET" && path === "reports/branch/payment-methods") {
        return { data: [{ MoneyTipe: "MXN", paymentMethod: "EFECTIVO", transactions: 3, total: 600 }, { MoneyTipe: "MXN", paymentMethod: "TARJETA", transactions: 2, total: 400 }] };
      }
      if (method === "GET" && path === "reports/branch/timeline") {
        return { data: [{ day: "2026-03-20", MoneyTipe: "MXN", total: 200 }] };
      }
      if (method === "GET" && path === "finances/branch/income") {
        return { data: [{ Id: 1, Name: "Venta", Amount: 210, Date: "2026-08-11T14:52:05.000Z", MoneyTipe: "MXN", Order_Id: 3415, Source: "ORDER" }] };
      }
      if (method === "GET" && path === "reports/branch/top-items") {
        return { data: [{ itemId: 1725, productName: "Playera", variantDescription: "Grande", quantity: 10, revenue: 2000, estimatedProfit: 1500 }] };
      }
      if (method === "GET" && path === "reports/branch/employees") {
        return { data: [{ employeeId: 1, name: "Ravekh", total: 3100.27, transactions: 2 }] };
      }
      throw new Error(`Unexpected call ${method} ${path}`);
    },
  };

  const api = new PosReportingApi(httpClient as never);
  const report = await api.getSalesReport(22, "token", 5);
  assert.equal(report.day.balance, 600);
  assert.equal(report.month.income, 1000);
  assert.equal(report.month.totalSales, 5);
  assert.equal(report.day.cashSalesPercentage, 60);
  assert.equal(report.day.cardSalesPercentage, 40);

  const series = await api.getIncomeSeries(22, "MONTH", "token", 5);
  assert.equal(series[0]?.amount, 200);
  const sales = await api.getSalesDetails(22, "MONTH", "TODOS", "token", 5);
  assert.equal(sales[0]?.id, "3415");
  const ticketPage = await api.getSalesTicketsByDateRange(22, "2026-08-01", "2026-08-11", "America/Mexico_City", 1, 50, "token", 5);
  assert.equal(ticketPage.items[0]?.id, 3415);
  assert.equal(ticketPage.pagination.totalItems, 1);

  const topProducts = await api.getProductsLeaderboard(22, "MONTH", "token", 5);
  const topEmployees = await api.getEmployeesLeaderboard(22, "MONTH", "token", 5);
  const topCustomers = await api.getCustomersLeaderboard(22, "MONTH", "token", 5);
  assert.equal(topProducts[0]?.name, "Playera · Grande");
  assert.equal(topProducts[0]?.quantity, 10);
  assert.equal(topEmployees[0]?.totalSales, 3100.27);
  assert.deepEqual(topCustomers, []);

  assert.equal(calls.filter((call) => call.path === "reports/branch/overview").length, 3);
  assert.equal(calls.filter((call) => call.path === "reports/branch/payment-methods").length, 3);
  assert.equal(calls.filter((call) => call.path === "finances/branch/income").length, 2);
  assert.ok(calls.every((call) => call.branchId === 5));
  assert.ok(calls.every((call) => call.query?.from && call.query?.to));

  const emptyReport = await api.getSalesReport(99);
  assert.equal(emptyReport.month.income, 0);
}
