export interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  stock: number;
  price: number;
  isActive: boolean;
}

export interface InventorySummary {
  totalItems: number;
  activeItems: number;
  outOfStockItems: number;
}
