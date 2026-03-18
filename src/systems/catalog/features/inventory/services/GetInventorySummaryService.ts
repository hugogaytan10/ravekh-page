import { fail, ok, type Result } from "../../../../shared/models/Result";
import type { IInventoryRepository } from "../interface/IInventoryRepository";
import type { InventorySummary } from "../model/InventoryItem";

export class GetInventorySummaryService {
  constructor(private readonly repository: IInventoryRepository) {}

  async execute(token: string, businessId: number): Promise<Result<InventorySummary>> {
    try {
      const items = await this.repository.getItems(token, businessId);

      const summary: InventorySummary = {
        totalItems: items.length,
        activeItems: items.filter((item) => item.isActive).length,
        outOfStockItems: items.filter((item) => item.stock <= 0).length,
      };

      return ok(summary, "Inventory summary loaded successfully.");
    } catch (error) {
      return fail(
        "Failed to load inventory summary.",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  }
}
