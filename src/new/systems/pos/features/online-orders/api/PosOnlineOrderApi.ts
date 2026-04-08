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
  Item_Id: number;
  Item_Name: string;
  Item_Price: number;
  Item_Stock: number;
  Item_Image: string;
  Item_Description: string;
  Item_CostPerItem?: number;
  Item_Quantity: number;
  Item_PriceTaxes: number | string;
  Item_Notes: string;
  Item_Type: "Product" | "Variant" | string;
  Employee_Name: string;
  Customer_Name: string;
  Category_Id?: number;
  Category_Name?: string;
  Color_Id?: number;
  Color_Name?: string;
  Size_Id?: number;
  Size_Name?: string;
  MoneyTipe?: string;
};

export class PosOnlineOrderApi implements IOnlineOrderRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async listByBusiness(businessId: number, token: string): Promise<OnlineOrder[]> {
    const response = await this.httpClient.request<
      OrderCatalogResponse[] | { data?: OrderCatalogResponse[]; Data?: OrderCatalogResponse[]; orders?: OrderCatalogResponse[] } | null
    >({
      method: "GET",
      path: `ordersCatalog/${businessId}`,
      token,
    });

    const rows = Array.isArray(response) ? response : response?.data ?? response?.Data ?? response?.orders ?? [];
    return rows.map((order) => this.toDomain(order));
  }

  async getById(orderId: number, token: string): Promise<OnlineOrder> {
    const response = await this.httpClient.request<OrderDetailItemResponse[] | null>({
      method: "GET",
      path: `products/ordercatalog/${orderId}`,
      token,
    });

    const details = Array.isArray(response) ? response : [];
    const total = details.reduce((acc, detail) => {
      const unitPrice = Number(detail.Item_PriceTaxes ?? detail.Item_Price ?? 0);
      const quantity = Number(detail.Item_Quantity ?? 0);
      return acc + unitPrice * quantity;
    }, 0);

    return new OnlineOrder(
      orderId,
      0,
      "PEDIDO",
      "Guest",
      total,
      "",
      "",
      "",
      details.map((detail, index) => ({
        id: Number(detail.Item_Id ?? index),
        name: this.toItemName(detail),
        price: Number(detail.Item_PriceTaxes ?? detail.Item_Price ?? 0),
        quantity: Number(detail.Item_Quantity ?? 0),
        image: detail.Item_Image ?? "",
        itemType: detail.Item_Type ?? "",
      })),
    );
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
      id: Number(detail.Item_Id ?? index),
      name: this.toItemName(detail),
      price: Number(detail.Item_PriceTaxes ?? detail.Item_Price ?? 0),
      quantity: Number(detail.Item_Quantity ?? 0),
      image: detail.Item_Image || "",
      itemType: detail.Item_Type ?? "",
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

  private toItemName(detail: OrderDetailItemResponse): string {
    const baseName = detail.Item_Name ?? "Producto";
    const normalizedType = (detail.Item_Type ?? "").toLowerCase();
    if (normalizedType !== "variant") {
      return baseName;
    }

    const attributes = [detail.Color_Name, detail.Size_Name].filter((value) => value && value !== "N/A");
    if (attributes.length === 0) {
      return baseName;
    }

    return `${baseName} (${attributes.join(" · ")})`;
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
