import type { InventoryItem } from "../model/InventoryItem";

export interface IInventoryRepository {
  getItems(token: string, businessId: number): Promise<InventoryItem[]>;
}
