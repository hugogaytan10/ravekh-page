import type { Result } from "../../../../shared/model/Result";
import type { Order, OrderStatus } from "../model/Order";

export interface IOrderRepository {
  getOrdersCatalog(businessId: number): Promise<Result<Order[]>>;
  updateOrderStatus(orderId: number, status: OrderStatus): Promise<Result<Order>>;
}
