import assert from "node:assert/strict";
import { PosProductsApi } from "../../../../src/new/systems/pos/features/products/api/PosProductsApi";
import { ProductsService } from "../../../../src/new/systems/pos/features/products/services/ProductsService";
import { ProductsManagementPage } from "../../../../src/new/systems/pos/features/products/pages/ProductsManagementPage";

export async function run(): Promise<void> {
  const calls: string[] = [];
  let createBody: unknown;
  let updateBody: unknown;
  const extraBodies: unknown[] = [];
  let importBody: unknown;
  let createCategoryBody: unknown;
  let updateCategoryBody: unknown;

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
        createBody = body;
        return { Product: { Id: 10, Business_Id: 7, Name: "Té", Available: true } };
      }

      if (method === "PUT" && path === "products/9") {
        updateBody = body;
        return null;
      }

      if (method === "GET" && path === "variants/product/9") {
        return [];
      }

      if (method === "POST" && path === "variants") {
        return { Id: 501 };
      }

      if (method === "GET" && path === "extras/product/9") {
        return null;
      }

      if (method === "POST" && path === "extras") {
        extraBodies.push(body);
        return { Id: 120 };
      }

      if (method === "PUT" && path === "products/available/8") {
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

      if (method === "DELETE" && path === "categories/2") {
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
      categoryId: 3,
      extras: [
        { description: "M", type: "TALLA" },
        { description: "VERDE", type: "COLOR" },
      ],
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
      extras: [
        { description: "XL", type: "TALLA" },
        { description: "AZUL", type: "COLOR" },
      ],
      images: [],
    },
    "token",
  );

  await page.archiveProduct(8, "token");

  const categories = await page.loadCategories(7, "token");
  const importResult = await page.importProducts(7, new File(["id,name\n1,Café"], "productos.csv", { type: "text/csv" }), "token");
  const createdCategory = await page.createCategory({ businessId: 7, name: "Pan", color: "#222" }, "token");
  const updatedCategory = await page.updateCategory({ id: 2, businessId: 7, name: "Pan dulce", color: "#333" }, "token");
  await page.deleteCategory(2, "token");

  assert.deepEqual(saved, { id: 10, name: "Té", available: true });
  assert.equal(updated.id, 9, "fallback de update debe conservar id al no recibir payload");

  assert.deepEqual(createBody, {
    Product: {
      Id: undefined,
      Business_Id: 7,
      Category_Id: 3,
      Name: "Té",
      Description: "Bebida",
      Color: "#000000",
      ForSale: true,
      ShowInStore: true,
      Available: true,
      Images: [],
      Barcode: undefined,
      Price: undefined,
      PromotionPrice: null,
      CostPerItem: undefined,
      Stock: undefined,
      ExpDate: null,
      MinStock: null,
      OptStock: null,
      Volume: false,
    },
    Variants: null,
    Extras: [
      { Description: "M", Type: "TALLA" },
      { Description: "VERDE", Type: "COLOR" },
    ],
  });

  assert.deepEqual(updateBody, {
    Id: 9,
    Business_Id: 7,
    Category_Id: undefined,
    Name: "Té chai",
    Description: "Bebida caliente",
    Color: "#000000",
    ForSale: true,
    ShowInStore: true,
    Available: true,
    Images: [],
    Barcode: undefined,
    Price: undefined,
    PromotionPrice: null,
    CostPerItem: undefined,
    Stock: undefined,
    ExpDate: null,
    MinStock: null,
    OptStock: null,
    Volume: false,
  });

  assert.deepEqual(extraBodies, [
    { Product_Id: 9, Description: "XL", Type: "TALLA" },
    { Product_Id: 9, Description: "AZUL", Type: "COLOR" },
  ]);

  assert.deepEqual(categories, [{ id: 1, name: "Bebidas", color: "#111" }]);
  assert.equal(importResult.imported, 4);
  assert.equal(importResult.message, "Importación OK");
  assert.equal(importBody instanceof FormData, true);
  assert.deepEqual(createdCategory, { id: 2, name: "Pan", color: "#222" });
  assert.deepEqual(updatedCategory, { id: 2, name: "Pan dulce", color: "#333" });

  assert.deepEqual(createCategoryBody, {
    Id: undefined,
    Business_Id: 7,
    Parent_Id: null,
    Name: "Pan",
    Color: "#222",
  });

  assert.deepEqual(updateCategoryBody, {
    Id: 2,
    Business_Id: 7,
    Parent_Id: null,
    Name: "Pan dulce",
    Color: "#333",
  });

  assert.deepEqual(calls, [
    "GET products/business/7",
    "POST products",
    "PUT products/9",
    "GET variants/product/9",
    "GET extras/product/9",
    "POST variants",
    "POST extras",
    "POST extras",
    "PUT products/available/8",
    "GET categories/business/7",
    "POST products/import/7",
    "POST categories",
    "PUT categories/2",
    "DELETE categories/2",
  ]);
}
