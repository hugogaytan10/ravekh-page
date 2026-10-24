import assert from "node:assert/strict";
import { PosProductsApi } from "../../../../src/new/systems/pos/features/products/api/PosProductsApi";

export async function run(): Promise<void> {
  const previousWindow = globalThis.window;
  Object.defineProperty(globalThis, "window", {configurable: true, value: {
    localStorage: {getItem: (key: string) => key === "pos-v2-branch-id" ? "1" : "7"},
  }});
  const rows = [
    {Id: 1, Visible: 1, Available: 1},
    {Id: 2, Visible: 0, Available: 0},
    {Id: 3, Visible: false, Available: false},
    {Id: 4, Visible: 0, Available: 1},
    {Id: 5, Visible: 1, Available: 0},
    {Id: 6},
  ].map(row => ({...row, Product_Id: 9, Description: "Variant " + row.Id}));
  const writes: Array<{path: string; body: unknown}> = [];
  const api = new PosProductsApi({request: async (options: {method: string; path: string; body?: unknown}) => {
    if (options.method === "PATCH") {writes.push({path: options.path, body: options.body}); return {};}
    assert.equal(options.method, "GET");
    if (options.path === "variants/product/9/branch") return {data: rows};
    if (options.path === "products/business/7/branch/9") return {data: {Id: 9, Business_Id: 7, Name: "Product"}};
    return [];
  }} as never);
  try {
    const product = await api.getById(9, "token", 7);
    assert.ok(product);
    assert.deepEqual(product.variants.map(variant => variant.id), [1, 4, 5, 6], "Editor excludes deletions while retaining other availability states");
    await (api as unknown as {syncVariants: (id: number, variants: typeof product.variants, token: string) => Promise<void>}).syncVariants(9, product.variants, "token");
    assert.ok(writes.every(write => !["variants/2/branch", "variants/3/branch"].includes(write.path)), "Saving the reopened editor cannot reactivate deleted variants");
    rows.splice(0, rows.length, {Id: 2, Product_Id: 9, Description: "Deleted", Visible: 0, Available: 0});
    assert.deepEqual((await api.getById(9, "token", 7))?.variants, [], "Deleting the last variant leaves the editor empty");
  } finally {
    if (previousWindow === undefined) delete (globalThis as {window?: Window}).window;
    else Object.defineProperty(globalThis, "window", {configurable: true, value: previousWindow});
  }
}
