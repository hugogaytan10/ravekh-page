import assert from "node:assert/strict";
import { PosInventoryApi } from "../../../../src/new/systems/pos/features/inventory/api/PosInventoryApi";
import { InventoryService } from "../../../../src/new/systems/pos/features/inventory/services/InventoryService";
import { InventoryManagementPage } from "../../../../src/new/systems/pos/features/inventory/pages/InventoryManagementPage";

export async function run(): Promise<void> {
  const calls: string[] = [];

  const httpClient = {
    request: async ({ method, path, query, body }: { method: string; path: string; query?: Record<string, unknown>; body?: unknown }) => {
      calls.push(`${method} ${path}${query ? `?page=${query.page}&limit=${query.limit}` : ""}`);

      if (method === "GET" && path === "products/business/9" && !query) {
        return [
          { Id: 1, Business_Id: 9, Name: "Leche", Stock: 2, Price: 30 },
          { Id: 2, Business_Id: 9, Name: "Pan", Stock: 40, Price: 15 },
        ];
      }

      if (method === "GET" && path === "products/business/9" && query) {
        return {
          products: [{ Id: 3, Business_Id: 9, Name: "Café", Stock: 1, Price: 45 }],
          pagination: {
            page: 2,
            pageSize: 20,
            total: 45,
            totalPages: 3,
            hasNext: true,
            hasPrev: true,
          },
        };
      }

      if (method === "PUT" && path === "products/3") {
        assert.deepEqual(body, { Stock: 20 });
        return undefined;
      }

      throw new Error(`Unexpected request ${method} ${path}`);
    },
  };

  const api = new PosInventoryApi(httpClient);
  const service = new InventoryService(api);
  const page = new InventoryManagementPage(service);

  const cards = await page.getInventoryCards(9, "token", 5);
  assert.deepEqual(cards, [
    { id: 1, name: "Leche", stock: 2, price: 30, status: "low" },
    { id: 2, name: "Pan", stock: 40, price: 15, status: "ok" },
  ]);

  const paginatedCards = await page.getInventoryCardsPaginated(9, "token", 5, 2, 20);
  assert.deepEqual(paginatedCards, {
    cards: [{ id: 3, name: "Café", stock: 1, price: 45, status: "low" }],
    pagination: {
      page: 2,
      pageSize: 20,
      total: 45,
      totalPages: 3,
      hasNext: true,
      hasPrev: true,
    },
  });

  await page.updateItemStock(3, 20, "token");

  assert.deepEqual(calls, [
    "GET products/business/9",
    "GET products/business/9?page=2&limit=20",
    "PUT products/3",
  ]);
}
