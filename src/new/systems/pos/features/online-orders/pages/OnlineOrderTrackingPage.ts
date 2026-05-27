import { OnlineOrderService } from "../services/OnlineOrderService";
import type { OnlineOrderItem } from "../model/OnlineOrder";

export interface OnlineOrderCardViewModel {
  id: number;
  customerName: string;
  status: string;
  total: number;
  address: string;
  paymentMethod: string;
  phoneNumber: string;
  items: OnlineOrderItem[];
}

export type OnlineOrderStatusFilter = "pending" | "all";
export type OnlineOrderStatus = "ENTREGADO" | "CANCELADO";

export class OnlineOrderTrackingPage {
  constructor(private readonly service: OnlineOrderService) {}

  async loadPendingOrders(businessId: number, token: string): Promise<OnlineOrderCardViewModel[]> {
    return this.loadOrders(businessId, "pending", token);
  }

  async loadOrders(
    businessId: number,
    statusFilter: OnlineOrderStatusFilter,
    token: string,
  ): Promise<OnlineOrderCardViewModel[]> {
    const orders = statusFilter === "pending"
      ? await this.service.getPendingOrders(businessId, token)
      : await this.service.getAllOrders(businessId, token);

    return orders.map((order) => ({
      id: order.id,
      customerName: order.customerName,
      status: order.status,
      total: order.total,
      address: order.address,
      paymentMethod: order.paymentMethod,
      phoneNumber: order.phoneNumber,
      items: order.items,
    }));
  }

  async loadOrderDetails(orderId: number, token: string): Promise<OnlineOrderCardViewModel> {
    const order = await this.service.getOrderDetails(orderId, token);
    return {
      id: order.id,
      customerName: order.customerName,
      status: order.status,
      total: order.total,
      address: order.address,
      paymentMethod: order.paymentMethod,
      phoneNumber: order.phoneNumber,
      items: order.items,
    };
  }

  async changeOrderStatus(orderId: number, status: OnlineOrderStatus, token: string): Promise<OnlineOrderCardViewModel> {
    const updated = await this.service.updateOrderStatus(orderId, { status }, token);
    return {
      id: updated.id,
      customerName: updated.customerName,
      status: updated.status,
      total: updated.total,
      address: updated.address,
      paymentMethod: updated.paymentMethod,
      phoneNumber: updated.phoneNumber,
      items: updated.items,
    };
  }
}
