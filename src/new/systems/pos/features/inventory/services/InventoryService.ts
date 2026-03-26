import { IInventoryRepository, InventoryPaginatedResult } from "../interface/IInventoryRepository";
import { InventoryItem } from "../model/InventoryItem";

export class InventoryService {
  constructor(private readonly repository: IInventoryRepository) {}

  async listItems(businessId: number, token: string): Promise<InventoryItem[]> {
    return this.repository.listByBusiness(businessId, token);
  }

  async listItemsPaginated(businessId: number, token: string, page: number, limit: number): Promise<InventoryPaginatedResult> {
    return this.repository.listByBusinessPaginated(businessId, token, page, limit);
  }

  async listLowStockItems(businessId: number, token: string, threshold: number): Promise<InventoryItem[]> {
    const items = await this.repository.listByBusiness(businessId, token);
    return items.filter((item) => item.isLowStock(threshold));
  }

  async updateStock(productId: number, stock: number, token: string): Promise<void> {
    await this.repository.updateStock(productId, { stock }, token);
  }
}
