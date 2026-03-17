import { OnlineOrder, UpdateOnlineOrderStatusDto } from "../model/OnlineOrder";

export interface IOnlineOrderRepository {
  listByBusiness(businessId: number, token: string): Promise<OnlineOrder[]>;
  getById(orderId: number, token: string): Promise<OnlineOrder>;
  updateStatus(orderId: number, payload: UpdateOnlineOrderStatusDto, token: string): Promise<OnlineOrder>;
}
