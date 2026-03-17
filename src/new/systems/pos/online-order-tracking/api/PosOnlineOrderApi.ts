import { HttpClient } from "../../../../core/api/HttpClient";
import { IOnlineOrderRepository } from "../interface/IOnlineOrderRepository";
import { OnlineOrder, UpdateOnlineOrderStatusDto } from "../model/OnlineOrder";

type OrderCatalogResponse = {
  Id: number;
  Business_Id: number;
  Status: string;
  Name?: string;
  Total: number;
};

export class PosOnlineOrderApi implements IOnlineOrderRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async listByBusiness(businessId: number, token: string): Promise<OnlineOrder[]> {
    const response = await this.httpClient.request<OrderCatalogResponse[]>({
      method: "GET",
      path: `ordersCatalog/${businessId}`,
      token,
    });

    return response.map((order) => this.toDomain(order));
  }

  async getById(orderId: number, token: string): Promise<OnlineOrder> {
    const response = await this.httpClient.request<OrderCatalogResponse>({
      method: "GET",
      path: `ordersCatalog/details/${orderId}`,
      token,
    });

    return this.toDomain(response);
  }

  async updateStatus(orderId: number, payload: UpdateOnlineOrderStatusDto, token: string): Promise<OnlineOrder> {
    const response = await this.httpClient.request<OrderCatalogResponse>({
      method: "PUT",
      path: `ordersCatalog/${orderId}`,
      token,
      body: {
        Order: {
          Status: payload.status,
        },
      },
    });

    return this.toDomain(response);
  }

  private toDomain(order: OrderCatalogResponse): OnlineOrder {
    return new OnlineOrder(order.Id, order.Business_Id, order.Status, order.Name ?? "Guest", order.Total);
  }
}
