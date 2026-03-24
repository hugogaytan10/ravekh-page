import { IOnlineOrderRepository } from "../interface/IOnlineOrderRepository";
import { OnlineOrder, UpdateOnlineOrderStatusDto } from "../model/OnlineOrder";

export class OnlineOrderService {
  constructor(private readonly repository: IOnlineOrderRepository) {}

  async getAllOrders(businessId: number, token: string): Promise<OnlineOrder[]> {
    return this.repository.listByBusiness(businessId, token);
  }

  async getPendingOrders(businessId: number, token: string): Promise<OnlineOrder[]> {
    const orders = await this.repository.listByBusiness(businessId, token);
    return orders.filter((order) => order.isPending());
  }

  async getOrderDetails(orderId: number, token: string): Promise<OnlineOrder> {
    return this.repository.getById(orderId, token);
  }

  async updateOrderStatus(orderId: number, payload: UpdateOnlineOrderStatusDto, token: string): Promise<OnlineOrder> {
    return this.repository.updateStatus(orderId, payload, token);
  }
}
