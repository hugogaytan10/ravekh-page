import assert from "node:assert/strict";
import { PosProductsApi } from "../../../../src/new/systems/pos/features/products/api/PosProductsApi";
import { ProductsService } from "../../../../src/new/systems/pos/features/products/services/ProductsService";
import { ProductsManagementPage } from "../../../../src/new/systems/pos/features/products/pages/ProductsManagementPage";

export async function run(): Promise<void> {
  const calls: string[] = [];
  let createBranchBody: unknown;
  let createMasterBody: unknown;
  let updateBranchBody: unknown;
  let updateMasterBody: unknown;
  let archiveBody: unknown;
  let importBody: unknown;
  let createCategoryBody: unknown;
  let updateCategoryBody: unknown;
  let created = false;
  let updated = false;
  const previousWindow = globalThis.window;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { localStorage: { getItem: (key: string) => key === "pos-v2-business-id" ? "7" : null } },
  });

  const httpClient = {
    request: async ({ method, path, body, query }: { method: string; path: string; body?: unknown; query?: Record<string, unknown> }) => {
      calls.push(`${method} ${path}`);

      if (method === "GET" && path === "products/business/noavailable/7") {
        assert.deepEqual(query, { page: 2, limit: 20 });
        return {
          products: [{ Id: 2, Business_Id: 7, Name: "Descatalogado", Available: 0 }],
          pagination: { page: 2, totalPages: 3, total: 42, limit: 20 },
        };
      }

      if (method === "GET" && path === "products/business/7/branch") {
        assert.deepEqual(query, { page: 1, limit: "MAX" });
        return [
          { Id: 1, Business_Id: 7, Name: "Café", Available: 1, Stock: 3 },
          { Id: 2, Business_Id: 7, Name: "Descatalogado", Available: 0 },
          ...(created ? [{ Id: 10, Business_Id: 7, Name: "Té", Description: "Bebida", Available: 1, Stock: 8 }] : []),
          ...(updated ? [{ Id: 9, Business_Id: 7, Name: "Té chai", Description: "Bebida caliente", Available: 1, Stock: 6 }] : []),
        ];
      }

      if (method === "POST" && path === "products/business/7/branch") {
        createBranchBody = body;
        created = true;
        return { data: { productId: 10 } };
      }
      if (method === "PUT" && path === "products/10") {
        createMasterBody = body;
        return null;
      }
      if (method === "GET" && path === "products/10") return { Id: 10, Business_Id: 7, Name: "Té", Description: "Bebida" };
      if (method === "PUT" && path === "products/9") {
        updateMasterBody = body;
        updated = true;
        return null;
      }
      if (method === "PATCH" && path === "products/business/7/branch/9") {
        updateBranchBody = body;
        return null;
      }
      if (method === "GET" && path === "products/9") return { Id: 9, Business_Id: 7, Name: "Té chai", Description: "Bebida caliente" };
      if (method === "GET" && /^variants\/product\/(9|10)\/branch$/.test(path)) return [];
      if (method === "GET" && /^extras\/product\/(9|10)$/.test(path)) return null;
      if (method === "PATCH" && path === "products/business/7/branch/8") {
        archiveBody = body;
        return undefined;
      }
      if (method === "POST" && path === "products/import/7") {
        importBody = body;
        return { imported: 4, message: "Importación OK" };
      }
      if (method === "GET" && path === "categories/business/7") {
        return [{ Id: 1, Name: "Bebidas", Color: "#111", Business_Id: 7, Parent_Id: null }];
      }
      if (method === "POST" && path === "categories") {
        createCategoryBody = body;
        return { Id: 2, Name: "Pan", Color: "#222", Business_Id: 7, Parent_Id: null };
      }
      if (method === "PUT" && path === "categories/2") {
        updateCategoryBody = body;
        return { Id: 2, Name: "Pan dulce", Color: "#333", Business_Id: 7, Parent_Id: null };
      }
      if (method === "DELETE" && path === "categories/2") return undefined;
      throw new Error(`Unexpected request ${method} ${path}`);
    },
  };

  try {
    const api = new PosProductsApi(httpClient);
    const service = new ProductsService(api);
    const page = new ProductsManagementPage(service);
    const vm = await page.loadProducts(7, "token");
    assert.deepEqual(vm, [
      { id: 1, name: "Café", available: true },
      { id: 2, name: "Descatalogado", available: false },
    ]);

    const discontinued = await service.listNoAvailableProductsPaginated(7, "token", 2, 20);
    assert.equal(discontinued.products[0]?.name, "Descatalogado");
    assert.equal(discontinued.pagination.total, 42);

    const saved = await page.saveProduct({
      businessId: 7, name: "Té", description: "Bebida", forSale: true, showInStore: true,
      available: true, categoryId: 3, price: 30, stock: 8, images: [],
    }, "token");
    const changed = await service.saveProduct({
      id: 9, businessId: 7, name: "Té chai", description: "Bebida caliente", forSale: true,
      showInStore: true, available: true, price: 42, stock: 6, images: [],
    }, "token");

    await page.archiveProduct(8, "token");
    const categories = await page.loadCategories(7, "token");
    const importResult = await page.importProducts(7, new File(["id,name\n1,Café"], "productos.csv", { type: "text/csv" }), "token");
    const createdCategory = await page.createCategory({ businessId: 7, name: "Pan", color: "#222" }, "token");
    const updatedCategory = await page.updateCategory({ id: 2, businessId: 7, name: "Pan dulce", color: "#333" }, "token");
    await page.deleteCategory(2, "token");

    assert.equal(saved.id, 10);
    assert.equal(changed.id, 9);
    assert.equal(changed.stock, 6);
    assert.deepEqual(createBranchBody, {
      Barcode: null, Category_Id: 3, Name: "Té", Color: null, Description: "Bebida", CostPerItem: null,
      ForSale: 1, Volume: 0, ExpDate: null, Price: 30, PromotionPrice: null, ShowInStore: 1,
      Available: 1, Showprice: 0, Source: "MANUAL", Stock: 8, MinStock: null, OptStock: null,
    });
    assert.deepEqual(createMasterBody, {
      Business_Id: 7, Category_Id: 3, Name: "Té", Description: "Bebida", Color: "#000000",
      ForSale: true, Volume: false, Images: [], Barcode: null, CostPerItem: null, ExpDate: null,
      WholesalePrices: [],
    });
    assert.equal((updateBranchBody as { Stock: number }).Stock, 6);
    assert.equal((updateMasterBody as { Business_Id: number }).Business_Id, 7);
    assert.deepEqual(archiveBody, { Available: 0 });
    assert.deepEqual(categories, [{ id: 1, name: "Bebidas", color: "#111" }]);
    assert.equal(importResult.imported, 4);
    assert.equal(importResult.message, "Importación OK");
    assert.deepEqual(importBody, { rows: [{ id: "1", name: "Café" }] });
    assert.deepEqual(createdCategory, { id: 2, name: "Pan", color: "#222" });
    assert.deepEqual(updatedCategory, { id: 2, name: "Pan dulce", color: "#333" });
    assert.deepEqual(createCategoryBody, { Id: undefined, Business_Id: 7, Parent_Id: null, Name: "Pan", Color: "#222" });
    assert.deepEqual(updateCategoryBody, { Id: 2, Business_Id: 7, Parent_Id: null, Name: "Pan dulce", Color: "#333" });
    assert.ok(calls.includes("POST products/business/7/branch"));
    assert.ok(calls.includes("PATCH products/business/7/branch/9"));
    assert.ok(calls.includes("PATCH products/business/7/branch/8"));
    assert.ok(!calls.includes("PUT products/available/8"));
  } finally {
    Object.defineProperty(globalThis, "window", { configurable: true, value: previousWindow });
  }
}
