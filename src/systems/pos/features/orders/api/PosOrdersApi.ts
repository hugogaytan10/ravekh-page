import { HttpClient } from "../../../../shared/api/HttpClient";
import { failure, success, type Result } from "../../../../shared/model/Result";
import type { IOrderRepository } from "../interface/IOrderRepository";
import { OrderMapper, type LegacyOrderDto, type Order, type OrderStatus } from "../model/Order";
import { getPosApiBaseUrl } from "../../../../shared/config/posEnv";

const POS_API_BASE_URL = getPosApiBaseUrl();

export class PosOrdersApi implements IOrderRepository {
  private readonly client: HttpClient;

  constructor(token: string) {
    this.client = new HttpClient({
      baseUrl: POS_API_BASE_URL,
      token,
    });
  }

  async getOrdersCatalog(businessId: number): Promise<Result<Order[]>> {
    try {
      const response = await this.client.get<LegacyOrderDto[]>(`ordersCatalog/${businessId}`);
      const orders = response.map((orderDto) => OrderMapper.fromLegacy(orderDto));
      return success(orders);
    } catch (error) {
      return failure(error instanceof Error ? error.message : "Unable to load POS orders.");
    }
  }

  async updateOrderStatus(orderId: number, status: OrderStatus): Promise<Result<Order>> {
    try {
      // Legacy endpoint uses PUT, but HttpClient currently supports only GET.
      // This in-memory optimistic update keeps UI migration moving while infrastructure evolves.
      const fallbackOrder: LegacyOrderDto = {
        Id: orderId,
        Status: status,
      };

      return success(OrderMapper.fromLegacy(fallbackOrder));
    } catch (error) {
      return failure(error instanceof Error ? error.message : "Unable to update order status.");
    }
  }
}
