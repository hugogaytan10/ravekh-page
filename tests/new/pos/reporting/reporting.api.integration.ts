import assert from "node:assert/strict";
import { PosReportingApi } from "../../../../src/new/systems/pos/features/reporting/api/PosReportingApi";

export async function run(): Promise<void> {
  const calls: Array<{ method: string; path: string; body?: unknown }> = [];

  const httpClient = {
    request: async ({ method, path, body }: { method: string; path: string; body?: unknown }) => {
      calls.push({ method, path, body });

      if (method === "GET" && path === "report/22") {
        return {
          data: {
            day: { balance: [{ total: "100" }], income: "200", earnings: "80", averageSale: "40", salesTotal: "5", cashSales: "60", cardSales: "40", mostSoldProduct: "Latte", mostSoldCategory: "Bebidas" },
            mes: { Balance: [{ currency: "MXN", total: 1000 }], Income: { TotalsByCurrency: [{ total: 3000 }] }, Earnings: 900, AverageSale: 75, SalesTotal: 40, CashSales: 50, CardSales: 50, MostSoldProduct: "Sandwich", MostSoldCategory: "Comida" },
            año: { Balance: 0, Income: 0, Earnings: 0, AverageSale: 0, SalesTotal: 0, CashSales: 0, CardSales: 0, MostSoldProduct: "", MostSoldCategory: "" },
          },
        };
      }

      if (method === "GET" && path === "income/month/22") {
        return { data: [{ date: "2026-03-20", amount: "200" }] };
      }

      if (method === "GET" && path === "report2/catalog-details-month/22") {
        return [{ id: 1, date: "2026-03-21T10:00:00Z", status: "ENTREGADO", products: [{ detailId: 2, name: "Latte", quantity: 2, detailAmount: 150 }] }];
      }

      if (method === "GET" && path === "report2/details-range/22?from=2026-08-01&to=2026-08-11&timezone=America%2FMexico_City&page=1&pageSize=50&source=all") {
        return {
          items: [{ Id: 3415, Type: "ORDER", Date: "2026-08-11T14:52:05.000Z", PaymentMethod: "EFECTIVO", MoneyTipe: "MXN", Employee_Name: "Nous", Total: 210, DiscountApplied: 0, TaxesApplied: 0, products: [{ Detail_Id: 6030, Item_Name: "Playera", Quantity: 2, UnitPrice: 105, DetailAmount: 210, Notes: null }] }],
          pagination: { page: 1, pageSize: 50, totalItems: 1, totalPages: 1 },
        };
      }

      if (method === "GET" && path === "report/products/month/22") {
        return [{ Id: 1725, Name: "jajajjiji", Quantity: 10, TotalSales: 2000, Earnings: 2000 }];
      }

      if (method === "GET" && path === "report/employee/month/22") {
        return [{ EmployeeId: 1, EmployeeName: "Ravekh", TotalSales: 3100.27, TotalOrders: 2 }];
      }

      if (method === "GET" && path === "report/customer/month/22") {
        return [{ CustomerId: 1, CustomerName: "Joncho Rosales", TotalSales: null, TotalOrders: null }];
      }

      throw new Error(`Unexpected call ${method} ${path}`);
    },
  };

  const api = new PosReportingApi(httpClient as never);

  const report = await api.getSalesReport(22, "token");
  assert.equal(report.day.balance, 100);
  assert.equal(report.month.balance, 1000);
  assert.equal(report.month.income, 3000);
  assert.equal(report.month.totalSales, 40);
  assert.equal(report.day.bestSeller, "Latte");

  const series = await api.getIncomeSeries(22, "MONTH", "token");
  assert.equal(series.length, 1);
  assert.equal(series[0].amount, 200);

  const sales = await api.getSalesDetails(22, "MONTH", "TODOS", "token");
  assert.equal(sales.length, 1);
  assert.equal(sales[0].productName, "Latte");

  const ticketPage = await api.getSalesTicketsByDateRange(22, "2026-08-01", "2026-08-11", "America/Mexico_City", 1, 50, "token");
  assert.equal(ticketPage.items[0]?.id, 3415);
  assert.equal(ticketPage.items[0]?.products[0]?.itemName, "Playera");
  assert.equal(ticketPage.pagination.totalItems, 1);

  const topProducts = await api.getProductsLeaderboard(22, "MONTH", "token");
  const topEmployees = await api.getEmployeesLeaderboard(22, "MONTH", "token");
  const topCustomers = await api.getCustomersLeaderboard(22, "MONTH", "token");
  assert.equal(topProducts[0]?.quantity, 10);
  assert.equal(topEmployees[0]?.totalSales, 3100.27);
  assert.equal(topCustomers[0]?.totalSales, 0);

  assert.deepEqual(
    calls.map((call) => `${call.method} ${call.path}`),
    [
      "GET report/22",
      "GET income/month/22",
      "GET report2/catalog-details-month/22",
      "GET report2/details-range/22?from=2026-08-01&to=2026-08-11&timezone=America%2FMexico_City&page=1&pageSize=50&source=all",
      "GET report/products/month/22",
      "GET report/employee/month/22",
      "GET report/customer/month/22",
    ],
  );

  const fallbackApi = new PosReportingApi({
    request: async ({ method, path }: { method: string; path: string }) => {
      if (method === "GET" && path === "report/99") {
        throw new Error("500 Internal Server Error");
      }
      return [];
    },
  } as never);
  const emptyReport = await fallbackApi.getSalesReport(99, "token");
  assert.equal(emptyReport.month.income, 0);
}
