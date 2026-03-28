import type { IInventoryRepository } from "../interface/IInventoryRepository";
import type { InventoryItem } from "../model/InventoryItem";
import { getPosApiBaseUrl } from "../../../../shared/config/posEnv";

const POS_API_BASE_URL = getPosApiBaseUrl();

type LegacyRecord = Record<string, unknown>;

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toStringValue = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

export class InventoryApi implements IInventoryRepository {
  async getItems(token: string, businessId: number): Promise<InventoryItem[]> {
    const response = await fetch(`${POS_API_BASE_URL}products/business/${businessId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        token,
      },
    });

    if (!response.ok) {
      throw new Error(`Unable to load inventory items. Status: ${response.status}.`);
    }

    const data = (await response.json()) as LegacyRecord[];

    return data.map((item) => ({
      id: toNumber(item.Id),
      sku: toStringValue(item.Sku, `SKU-${toNumber(item.Id)}`),
      name: toStringValue(item.Name),
      stock: toNumber(item.Stock),
      price: toNumber(item.Price),
      isActive: item.Available !== false,
    }));
  }
}
