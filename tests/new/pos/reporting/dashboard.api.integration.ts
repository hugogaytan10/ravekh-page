import assert from "node:assert/strict";
import { PosDashboardApi } from "../../../../src/new/systems/pos/features/dashboard/api/PosDashboardApi";

export async function run(): Promise<void> {
  const calls: string[] = [];

  const httpClient = {
    request: async ({ path }: { path: string }) => {
      calls.push(path);

      if (path.includes("most-sold-products-by-month")) {
        return { data: [{ ProductName: "Americano", TotalSales: 12 }] };
      }

      if (path.includes("most-sold-categories-by-month")) {
        return { Data: [{ CategoryName: "Bebidas", TotalSales: 18 }] };
      }

      if (path.includes("customers-added-today")) {
        return { Total: 4 };
      }

      return { current: 10, previous: 8 };
    },
  };

  const api = new PosDashboardApi(httpClient as never);
  const snapshot = await api.getSnapshot(9, 3, "token");

  assert.equal(snapshot.topProducts.length, 1);
  assert.equal(snapshot.topProducts[0]?.name, "Americano");
  assert.equal(snapshot.topProducts[0]?.quantity, 12);
  assert.equal(snapshot.topCategories[0]?.name, "Bebidas");
  assert.equal(snapshot.topCategories[0]?.quantity, 18);
  assert.equal(snapshot.newCustomersToday, 4);
  assert.equal(calls.some((entry) => entry.endsWith("/9/03")), true, "month should be zero-padded");
}
