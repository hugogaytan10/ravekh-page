import { InventoryItem, UpdateInventoryStockDto } from "../model/InventoryItem";

export interface IInventoryRepository {
  listByBusiness(businessId: number, token: string): Promise<InventoryItem[]>;
  updateStock(productId: number, payload: UpdateInventoryStockDto, token: string): Promise<void>;
}
