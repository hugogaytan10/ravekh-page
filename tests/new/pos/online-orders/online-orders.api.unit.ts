import assert from "node:assert/strict";
import { PosOnlineOrderApi } from "../../../../src/new/systems/pos/features/online-orders/api/PosOnlineOrderApi";

export async function run(): Promise<void> {
  const requestedPaths: string[] = [];
  const httpClient = {
    async request({ path }: { path: string }) {
      requestedPaths.push(path);
      if (path === "ordersCatalog/10") {
        return [
          { Id: 1, Business_Id: 10, Status: "PEDIDO", Name: "Ana", Total: 250, Delivery: 1 },
          { Id: 2, Business_Id: 10, Status: "PEDIDO", Name: "Luis", Total: 375, Delivery: 0 },
        ];
      }

      if (path === "products/ordercatalog/1") {
        return [];
      }

      throw new Error(`Unexpected request: ${path}`);
    },
  };
  const api = new PosOnlineOrderApi(httpClient as never);

  const orders = await api.listByBusiness(10, "token");
  assert.equal(orders[0]?.total, 250);
  assert.equal(orders[0]?.deliveryMethod, "Recoger en tienda");
  assert.equal(orders[1]?.total, 375);
  assert.equal(orders[1]?.deliveryMethod, "Entrega a domicilio");

  await api.getById(1, "token");
  assert.deepEqual(requestedPaths, ["ordersCatalog/10", "products/ordercatalog/1"]);
}
