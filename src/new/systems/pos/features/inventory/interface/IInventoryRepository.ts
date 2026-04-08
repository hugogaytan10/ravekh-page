import { PaginatedMeta } from "../../../shared/model/Pagination";
import { InventoryItem, UpdateInventoryStockDto } from "../model/InventoryItem";

export type InventoryPaginatedResult = {
  items: InventoryItem[];
  pagination: PaginatedMeta;
};

export interface IInventoryRepository {
  listByBusiness(businessId: number, token: string): Promise<InventoryItem[]>;
  listByBusinessPaginated(businessId: number, token: string, page: number, limit: number): Promise<InventoryPaginatedResult>;
  updateStock(productId: number, payload: UpdateInventoryStockDto, token: string): Promise<void>;
}
