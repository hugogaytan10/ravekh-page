import { HttpClient } from "../../../../core/api/HttpClient";
import { IInventoryRepository } from "../interface/IInventoryRepository";
import { InventoryItem, UpdateInventoryStockDto } from "../model/InventoryItem";

type ProductResponse = {
  Id: number;
  Business_Id: number;
  Name: string;
  Stock: number;
  Price: number;
};

export class PosInventoryApi implements IInventoryRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async listByBusiness(businessId: number, token: string): Promise<InventoryItem[]> {
    const response = await this.httpClient.request<ProductResponse[]>({
      method: "GET",
      path: `products/business/${businessId}`,
      token,
    });

    return response.map((item) => this.toDomain(item));
  }

  async updateStock(productId: number, payload: UpdateInventoryStockDto, token: string): Promise<void> {
    await this.httpClient.request<void>({
      method: "PUT",
      path: `products/${productId}`,
      token,
      body: {
        Stock: payload.stock,
      },
    });
  }

  private toDomain(item: ProductResponse): InventoryItem {
    return new InventoryItem(item.Id, item.Business_Id, item.Name, item.Stock, item.Price);
  }
}
