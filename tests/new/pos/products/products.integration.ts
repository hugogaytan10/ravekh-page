import assert from "node:assert/strict";
import { PosProductsApi } from "../../../../src/new/systems/pos/features/products/api/PosProductsApi";
import { ProductsService } from "../../../../src/new/systems/pos/features/products/services/ProductsService";
import { ProductsManagementPage } from "../../../../src/new/systems/pos/features/products/pages/ProductsManagementPage";

export async function run(): Promise<void> {
  const calls: string[] = [];

  const httpClient = {
    request: async ({ method, path }: { method: string; path: string }) => {
      calls.push(`${method} ${path}`);

      if (method === "GET" && path === "products/business/7") {
        return [{ Id: 1, Business_Id: 7, Name: "Café", Available: true }];
      }

      if (method === "POST" && path === "products") {
        return undefined;
      }

      if (method === "PUT" && path === "products/available/8") {
        return undefined;
      }

      throw new Error(`Unexpected request ${method} ${path}`);
    },
  };

  const api = new PosProductsApi(httpClient);
  const service = new ProductsService(api);
  const page = new ProductsManagementPage(service);

  const vm = await page.loadProducts(7, "token");
  assert.deepEqual(vm, [{ id: 1, name: "Café", available: true }]);

  const saved = await page.saveProduct(
    {
      businessId: 7,
      name: "Té",
      description: "Bebida",
      forSale: true,
      showInStore: true,
      available: true,
      images: [],
    },
    "token",
  );

  await page.archiveProduct(8, "token");

  assert.deepEqual(saved, { id: 0, name: "Té", available: true });
  assert.deepEqual(calls, ["GET products/business/7", "POST products", "PUT products/available/8"]);
}
