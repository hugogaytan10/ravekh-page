import assert from "node:assert/strict";
import { PosProductsApi } from "../../../../src/new/systems/pos/features/products/api/PosProductsApi";
import { ProductsService } from "../../../../src/new/systems/pos/features/products/services/ProductsService";
import { ProductsManagementPage } from "../../../../src/new/systems/pos/features/products/pages/ProductsManagementPage";

export async function run(): Promise<void> {
  const calls: string[] = [];
  let updateBody: unknown;

  const httpClient = {
    request: async ({ method, path, body }: { method: string; path: string; body?: unknown }) => {
      calls.push(`${method} ${path}`);

      if (method === "GET" && path === "products/business/7") {
        return [
          {
            Id: 1,
            Business_Id: 7,
            Name: "Café",
            Available: true,
            Variants: [{ Id: 99, Description: "Grande", Price: 42, Stock: 3, PromotionPrice: 39 }],
          },
          { Id: 2, Business_Id: 7, Name: "Descatalogado", Available: 0 },
        ];
      }

      if (method === "POST" && path === "products") {
        return undefined;
      }

      if (method === "PUT" && path === "products/9") {
        updateBody = body;
        return null;
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
  assert.deepEqual(vm, [
    { id: 1, name: "Café", available: true },
    { id: 2, name: "Descatalogado", available: false },
  ]);

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

  const updated = await service.saveProduct(
    {
      id: 9,
      businessId: 7,
      name: "Té chai",
      description: "Bebida caliente",
      forSale: true,
      showInStore: true,
      available: true,
      variants: [{ description: "Grande", price: 42 }],
      images: [],
    },
    "token",
  );

  await page.archiveProduct(8, "token");

  assert.deepEqual(saved, { id: 0, name: "Té", available: true });
  assert.equal(updated.id, 9, "fallback de update debe conservar id al no recibir payload");
  assert.deepEqual(updateBody, {
    Product: {
      Id: 9,
      Business_Id: 7,
      Category_Id: undefined,
      Name: "Té chai",
      Description: "Bebida caliente",
      Color: null,
      ForSale: true,
      ShowInStore: true,
      Available: true,
      Image: undefined,
      Images: [],
      Barcode: undefined,
      Price: undefined,
      PromotionPrice: null,
      CostPerItem: undefined,
      Stock: undefined,
      ExpDate: null,
      MinStock: null,
      OptStock: null,
      Quantity: null,
      Volume: false,
    },
    Variants: [
      {
        Id: undefined,
        Product_Id: undefined,
        Description: "Grande",
        Barcode: null,
        Color: null,
        Price: 42,
        PromotionPrice: null,
        CostPerItem: null,
        Stock: null,
        ExpDate: null,
        MinStock: null,
        OptStock: null,
      },
    ],
  });
  assert.deepEqual(calls, ["GET products/business/7", "POST products", "PUT products/9", "PUT products/available/8"]);
}
