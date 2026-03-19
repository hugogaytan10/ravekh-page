export class InventoryItem {
  constructor(
    public readonly id: number,
    public readonly businessId: number,
    public readonly name: string,
    public readonly stock: number,
    public readonly price: number,
  ) {}

  isLowStock(threshold: number): boolean {
    return this.stock <= threshold;
  }
}

export interface UpdateInventoryStockDto {
  stock: number;
}
