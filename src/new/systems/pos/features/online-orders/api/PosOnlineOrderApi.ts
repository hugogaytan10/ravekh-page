import { HttpClient } from "../../../../core/api/HttpClient";
import { IOnlineOrderRepository } from "../interface/IOnlineOrderRepository";
import { OnlineOrder, OnlineOrderItem, UpdateOnlineOrderStatusDto } from "../model/OnlineOrder";

type OrderCatalogResponse = {
  Id: number;
  Business_Id: number;
  Status: string;
  Name?: string;
  Total: number;
  Address?: string;
  PaymentMethod?: string;
  PhoneNumber?: string;
};

type UpdateOrderStatusResponse = OrderCatalogResponse | {
  order?: OrderCatalogResponse;
  Order?: OrderCatalogResponse;
};

type OrderDetailItemResponse = {
  Id?: number;
  Name?: string;
  Price?: number;
  Item_Quantity?: number;
  Image?: string;
  Images?: string[];
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
    const response = await this.httpClient.request<
      | OrderCatalogResponse
      | { order?: OrderCatalogResponse; orderDetails?: OrderDetailItemResponse[] }
    >({
      method: "GET",
      path: `ordersCatalog/details/${orderId}`,
      token,
    });

    const order = "order" in response && response.order ? response.order : response;
    const details = "orderDetails" in response && Array.isArray(response.orderDetails) ? response.orderDetails : [];
    return this.toDomain(order, details);
  }

  async updateStatus(orderId: number, payload: UpdateOnlineOrderStatusDto, token: string): Promise<OnlineOrder> {
    const statusAlternatives = this.resolveStatusAlternatives(payload.status);
    let lastError: unknown = null;

    for (const status of statusAlternatives) {
      try {
        const response = await this.httpClient.request<UpdateOrderStatusResponse>({
          method: "PUT",
          path: `ordersCatalog/${orderId}`,
          token,
          body: {
            Order: {
              Status: status,
            },
          },
        });

        const parsed = this.extractOrderResponse(response);
        if (parsed) {
          return this.toDomain(parsed);
        }

        return this.getById(orderId, token);
      } catch (cause) {
        lastError = cause;
      }
    }

    throw lastError instanceof Error ? lastError : new Error("No se pudo actualizar el estatus del pedido.");
  }

  private toDomain(order: OrderCatalogResponse, details: OrderDetailItemResponse[] = []): OnlineOrder {
    const items: OnlineOrderItem[] = details.map((detail, index) => ({
      id: Number(detail.Id ?? index),
      name: detail.Name ?? "Producto",
      price: Number(detail.Price ?? 0),
      quantity: Number(detail.Item_Quantity ?? 0),
      image: detail.Image || detail.Images?.[0] || "",
    }));

    return new OnlineOrder(
      order.Id,
      order.Business_Id,
      order.Status,
      order.Name ?? "Guest",
      Number(order.Total ?? 0),
      order.Address ?? "",
      order.PaymentMethod ?? "",
      order.PhoneNumber ?? "",
      items,
    );
  }

  private extractOrderResponse(response: UpdateOrderStatusResponse): OrderCatalogResponse | null {
    if ("Id" in response) {
      return response;
    }

    if ("order" in response && response.order) {
      return response.order;
    }

    if ("Order" in response && response.Order) {
      return response.Order;
    }

    return null;
  }

  private resolveStatusAlternatives(status: UpdateOnlineOrderStatusDto["status"]): UpdateOnlineOrderStatusDto["status"][] {
    if (status === "CANCELADO") {
      return ["CANCELADO", "cancelled"];
    }

    if (status === "ENTREGADO") {
      return ["ENTREGADO", "completed"];
    }

    return [status];
  }
}
