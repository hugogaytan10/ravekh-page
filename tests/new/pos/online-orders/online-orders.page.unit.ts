import assert from "node:assert/strict";
import { OnlineOrderTrackingPage } from "../../../../src/new/systems/pos/features/online-orders/pages/OnlineOrderTrackingPage";
import { OnlineOrder } from "../../../../src/new/systems/pos/features/online-orders/model/OnlineOrder";

class FakeOnlineOrderService {
  async getPendingOrders(): Promise<OnlineOrder[]> {
    return [new OnlineOrder(1, 10, "PEDIDO", "Ana", 120, "Calle 1", "EFECTIVO", "5555555555", [
      { id: 1, name: "Pizza", price: 120, quantity: 1, image: "https://img/pizza.png" },
    ])];
  }

  async getAllOrders(): Promise<OnlineOrder[]> {
    return [
      new OnlineOrder(1, 10, "PEDIDO", "Ana", 120, "Calle 1", "EFECTIVO", "5555555555"),
      new OnlineOrder(2, 10, "ENTREGADO", "Luis", 300, "Calle 2", "TARJETA", "5550000000"),
    ];
  }

  async getOrderDetails(orderId: number): Promise<OnlineOrder> {
    return new OnlineOrder(orderId, 10, "PEDIDO", "Cliente Detalle", 150, "Calle 99", "EFECTIVO", "5551112233", [
      { id: 4, name: "Hamburguesa", price: 75, quantity: 2, image: "https://img/burger.png" },
    ]);
  }

  async updateOrderStatus(orderId: number, payload: { status: "ENTREGADO" | "CANCELADO" | "PEDIDO" | "pending" | "accepted" | "preparing" | "completed" | "cancelled" }): Promise<OnlineOrder> {
    return new OnlineOrder(orderId, 10, payload.status, "Cliente Detalle", 150, "Calle 99", "EFECTIVO", "5551112233", [
      { id: 4, name: "Hamburguesa", price: 75, quantity: 2, image: "https://img/burger.png" },
    ]);
  }
}

export async function run(): Promise<void> {
  const page = new OnlineOrderTrackingPage(new FakeOnlineOrderService() as never);

  const pending = await page.loadOrders(10, "pending", "token");
  assert.equal(pending.length, 1);
  assert.equal(pending[0]?.status, "PEDIDO");

  const all = await page.loadOrders(10, "all", "token");
  assert.equal(all.length, 2);

  const detail = await page.loadOrderDetails(55, "token");
  assert.equal(detail.id, 55);
  assert.equal(detail.customerName, "Cliente Detalle");
  assert.equal(detail.address, "Calle 99");
  assert.equal(detail.items.length, 1);

  const updated = await page.changeOrderStatus(55, "ENTREGADO", "token");
  assert.equal(updated.status, "ENTREGADO");
}
