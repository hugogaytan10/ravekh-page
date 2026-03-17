import { InventoryService } from "../services/InventoryService";

type InventoryCardViewModel = {
  id: number;
  name: string;
  stock: number;
  price: number;
  status: "low" | "ok";
};

export class InventoryManagementPage {
  constructor(private readonly inventoryService: InventoryService) {}

  async getInventoryCards(
    businessId: number,
    token: string,
    lowStockThreshold: number,
  ): Promise<InventoryCardViewModel[]> {
    const items = await this.inventoryService.listItems(businessId, token);

    return items.map((item) => ({
      id: item.id,
      name: item.name,
      stock: item.stock,
      price: item.price,
      status: item.isLowStock(lowStockThreshold) ? "low" : "ok",
    }));
  }

  async updateItemStock(productId: number, stock: number, token: string): Promise<void> {
    await this.inventoryService.updateStock(productId, stock, token);
  }
}
