import type { BusinessProfile, BusinessTax, SalesCategory, SalesProduct } from "../models/SalesModels";

type LegacyRecord = Record<string, unknown>;

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toOptionalNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toStringValue = (value: unknown, fallback = ""): string => {
  return typeof value === "string" ? value : fallback;
};

const toBooleanValue = (value: unknown, fallback = true): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  return fallback;
};

export class SalesMapper {
  static productFromLegacy(data: LegacyRecord): SalesProduct {
    const image = toStringValue(data.Image) || (Array.isArray(data.Images) ? toStringValue(data.Images[0]) : "");

    return {
      id: toNumber(data.Id),
      businessId: toNumber(data.Business_Id),
      categoryId: toOptionalNumber(data.Category_Id),
      name: toStringValue(data.Name),
      description: toStringValue(data.Description),
      price: toNumber(data.Price),
      stock: toOptionalNumber(data.Stock),
      barcode: toStringValue(data.Barcode) || null,
      image,
      available: toBooleanValue(data.Available, true),
    };
  }

  static categoryFromLegacy(data: LegacyRecord): SalesCategory {
    return {
      id: toNumber(data.Id),
      businessId: toNumber(data.Business_Id),
      name: toStringValue(data.Name),
      color: toStringValue(data.Color, "#7C3AED"),
      available: toBooleanValue(data.Available, true),
    };
  }

  static businessFromLegacy(data: LegacyRecord): BusinessProfile {
    return {
      id: toNumber(data.Id),
      name: toStringValue(data.Name),
      color: toStringValue(data.Color, "#7C3AED"),
      plan: toStringValue(data.Plan, "FREE"),
    };
  }

  static taxFromLegacy(data: LegacyRecord): BusinessTax {
    return {
      id: toNumber(data.Id),
      businessId: toNumber(data.Business_Id),
      name: toStringValue(data.Name),
      percentage: toNumber(data.Percentage),
      available: toBooleanValue(data.Available, true),
    };
  }
}
