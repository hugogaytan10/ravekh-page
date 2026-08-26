import assert from "node:assert/strict";
import { PosProductsApi } from "../../../../src/new/systems/pos/features/products/api/PosProductsApi";
import { ProductsService } from "../../../../src/new/systems/pos/features/products/services/ProductsService";

export async function run(): Promise<void> {
  const calls: Array<{ method: string; path: string; body?: unknown }> = [];
  const httpClient = {
    async request({ method, path, query, body }: { method: string; path: string; query?: Record<string, unknown>; body?: unknown }) {
      calls.push({ method, path, body });
      if (method === "PUT") return undefined;
      assert.equal(method, "GET");
      assert.equal(path, "products/business/noavailable/7");
      assert.deepEqual(query, { page: 2, limit: 20 });
      return {
        products: [{ Id: 9, Business_Id: 7, Name: "Producto anterior", Available: 0 }],
        pagination: { page: 2, pageSize: 20, total: 21, totalPages: 2 },
      };
    },
  };

  const service = new ProductsService(new PosProductsApi(httpClient as never));
  const result = await service.listNoAvailableProductsPaginated(7, "token", 2, 20);

  assert.equal(result.products[0]?.name, "Producto anterior");
  assert.equal(result.products[0]?.available, false);
  assert.equal(result.pagination.page, 2);
  assert.equal(result.pagination.total, 21);

  await service.restoreProduct(9, "token");
  assert.deepEqual(calls[1], {
    method: "PUT",
    path: "products/available/9",
    body: { Available: 1 },
  });
}
