import type { Result } from "../../../../shared/model/Result";
import { failure, success } from "../../../../shared/model/Result";
import type { IOrderRepository } from "../interface/IOrderRepository";
import type { Order, OrderStatus } from "../model/Order";

export class ManageOrdersService {
  constructor(private readonly repository: IOrderRepository) {}

  async loadBusinessOrders(businessId: number): Promise<Result<Order[]>> {
    return this.repository.getOrdersCatalog(businessId);
  }

  async markAsDelivered(orderId: number): Promise<Result<Order>> {
    return this.updateStatus(orderId, "DELIVERED");
  }

  async cancelOrder(orderId: number): Promise<Result<Order>> {
    return this.updateStatus(orderId, "CANCELLED");
  }

  private async updateStatus(orderId: number, status: OrderStatus): Promise<Result<Order>> {
    if (orderId <= 0) {
      return failure("The order id must be a positive number.");
    }

    return this.repository.updateOrderStatus(orderId, status);
  }

  filterByStatus(orders: Order[], status: OrderStatus | "ALL"): Order[] {
    if (status === "ALL") {
      return orders;
    }

    return orders.filter((order) => order.status === status);
  }

  calculateTotalRevenue(orders: Order[]): number {
    return orders.reduce((accumulator, order) => accumulator + order.total, 0);
  }
}
