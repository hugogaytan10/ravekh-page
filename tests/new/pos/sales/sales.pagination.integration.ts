import assert from "node:assert/strict";
import { PosProductApi } from "../../../../src/new/systems/pos/features/sales/api/PosProductApi";
import { ProductService } from "../../../../src/new/systems/pos/features/sales/services/ProductService";

export async function run(): Promise<void> {
  const calls: string[] = [];

  const httpClient = {
    request: async ({ method, path, query, body }: { method: string; path: string; query?: Record<string, unknown>; body?: unknown }) => {
      calls.push(`${method} ${path}${query ? `?${new URLSearchParams(Object.entries(query).map(([k, v]) => [k, String(v)])).toString()}` : ""}`);

      if (method === "POST" && path === "products/stock/availablegtzero/5") {
        assert.deepEqual(body, { Limit: "EMPRENDEDOR" });
        return {
          products: [{ Id: 1, Business_Id: 5, Name: "Americano", Price: 39, Stock: 20, Available: true, ForSale: true, Category_Name: "Bebidas" }],
          pagination: { page: 2, pageSize: 20, total: 45, totalPages: 3, hasNext: true, hasPrev: true, categoryIds: [10, 11] },
        };
      }

      if (method === "GET" && path === "products/category/10") {
        return {
          products: [{ Id: 2, Business_Id: 5, Name: "Latte", Price: 45, Stock: 10, Available: true, ForSale: true, Category_Name: "Bebidas" }],
          pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1, hasNext: false, hasPrev: false, categoryIds: [10] },
        };
      }

      if (method === "GET" && path === "categories/business/5") {
        return [{ Id: 10, Name: "Bebidas" }, { Id: 11, Name: "Postres" }];
      }

      throw new Error(`Unexpected request ${method} ${path}`);
    },
  };

  const api = new PosProductApi(httpClient);
  const service = new ProductService(api);

  const paginated = await service.getSellableProductsPaginated(5, "token", "EMPRENDEDOR", 2, null);
  assert.equal(paginated.products[0]?.name, "Americano");
  assert.deepEqual(paginated.pagination.categoryIds, [10, 11]);

  const byCategory = await service.getSellableProductsPaginated(5, "token", "EMPRENDEDOR", 1, 10);
  assert.equal(byCategory.products[0]?.name, "Latte");

  const categories = await service.getBusinessCategories(5, "token");
  assert.deepEqual(categories, [{ id: 10, name: "Bebidas" }, { id: 11, name: "Postres" }]);

  assert.deepEqual(calls, [
    "POST products/stock/availablegtzero/5?page=2",
    "GET products/category/10?limit=EMPRENDEDOR&page=1",
    "GET categories/business/5",
  ]);
}
