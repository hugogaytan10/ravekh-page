import { OnlineOrderService } from "../services/OnlineOrderService";

export interface OnlineOrderCardViewModel {
  id: number;
  customerName: string;
  status: string;
  total: number;
}

export class OnlineOrderTrackingPage {
  constructor(private readonly service: OnlineOrderService) {}

  async loadPendingOrders(businessId: number, token: string): Promise<OnlineOrderCardViewModel[]> {
    const orders = await this.service.getPendingOrders(businessId, token);

    return orders.map((order) => ({
      id: order.id,
      customerName: order.customerName,
      status: order.status,
      total: order.total,
    }));
  }
}
