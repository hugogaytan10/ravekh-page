import type { StorefrontWholesalePrice } from "../model/CatalogStorefrontModels";

export const CATALOG_QUOTABLE_LABEL = "Cotizable";

export const getCatalogPriceValue = (value: unknown) => {
  const price = Number(value);
  return Number.isFinite(price) && price > 0 ? price : null;
};

export const getEffectiveCatalogPrice = (price: unknown, promotionPrice?: unknown) =>
  getCatalogPriceValue(promotionPrice) ?? getCatalogPriceValue(price);

const normalizeTier = (tier: Partial<StorefrontWholesalePrice> | null | undefined): StorefrontWholesalePrice | null => {
  if (!tier) return null;
  const price = getCatalogPriceValue(tier.price);
  const minQuantity = Math.floor(Number(tier.minQuantity));
  if (!price || !Number.isFinite(minQuantity) || minQuantity < 2) return null;

  const id = Number(tier.id);
  const productId = Number(tier.productId);
  const variantId = Number(tier.variantId);

  return {
    ...(Number.isInteger(id) && id > 0 ? { id } : {}),
    ...(Number.isInteger(productId) && productId > 0 ? { productId } : {}),
    ...(Number.isInteger(variantId) && variantId > 0 ? { variantId } : {}),
    price,
    minQuantity,
  };
};

export const normalizeWholesalePriceTiers = (
  wholesalePrices?: readonly StorefrontWholesalePrice[] | null,
  legacyWholesalePrice?: unknown,
  legacyWholesaleMinQuantity?: unknown,
): StorefrontWholesalePrice[] => {
  const uniqueByQuantity = new Map<number, StorefrontWholesalePrice>();

  for (const rawTier of wholesalePrices ?? []) {
    const tier = normalizeTier(rawTier);
    if (tier) uniqueByQuantity.set(tier.minQuantity, tier);
  }

  if (uniqueByQuantity.size === 0) {
    const legacy = normalizeTier({
      price: Number(legacyWholesalePrice),
      minQuantity: Number(legacyWholesaleMinQuantity),
    });
    if (legacy) uniqueByQuantity.set(legacy.minQuantity, legacy);
  }

  return Array.from(uniqueByQuantity.values()).sort((a, b) => a.minQuantity - b.minQuantity);
};

export const getApplicableWholesaleTier = (
  wholesalePrices: readonly StorefrontWholesalePrice[] | null | undefined,
  quantity: unknown,
  legacyWholesalePrice?: unknown,
  legacyWholesaleMinQuantity?: unknown,
): StorefrontWholesalePrice | null => {
  const parsedQuantity = Math.floor(Number(quantity));
  if (!Number.isFinite(parsedQuantity) || parsedQuantity < 1) return null;

  const tiers = normalizeWholesalePriceTiers(
    wholesalePrices,
    legacyWholesalePrice,
    legacyWholesaleMinQuantity,
  );

  let applied: StorefrontWholesalePrice | null = null;
  for (const tier of tiers) {
    if (parsedQuantity < tier.minQuantity) break;
    applied = tier;
  }
  return applied;
};

export const getNextWholesaleTier = (
  wholesalePrices: readonly StorefrontWholesalePrice[] | null | undefined,
  quantity: unknown,
  legacyWholesalePrice?: unknown,
  legacyWholesaleMinQuantity?: unknown,
): StorefrontWholesalePrice | null => {
  const parsedQuantity = Math.max(0, Math.floor(Number(quantity) || 0));
  const tiers = normalizeWholesalePriceTiers(
    wholesalePrices,
    legacyWholesalePrice,
    legacyWholesaleMinQuantity,
  );
  return tiers.find((tier) => tier.minQuantity > parsedQuantity) ?? null;
};

export const getEffectiveCatalogPriceForQuantity = (
  price: unknown,
  promotionPrice: unknown,
  wholesalePrices: readonly StorefrontWholesalePrice[] | null | undefined,
  quantity: unknown,
  legacyWholesalePrice?: unknown,
  legacyWholesaleMinQuantity?: unknown,
) =>
  getApplicableWholesaleTier(
    wholesalePrices,
    quantity,
    legacyWholesalePrice,
    legacyWholesaleMinQuantity,
  )?.price ?? getEffectiveCatalogPrice(price, promotionPrice);

export const formatCatalogPrice = (value: unknown, formatter: (value: number) => string) => {
  const price = getCatalogPriceValue(value);
  return price ? formatter(price) : CATALOG_QUOTABLE_LABEL;
};

export const formatCatalogTotal = (
  items: Array<{
    price?: unknown;
    promotionPrice?: unknown;
    wholesalePrice?: unknown;
    wholesaleMinQuantity?: unknown;
    wholesalePrices?: StorefrontWholesalePrice[];
    quantity: number;
  }>,
  formatter: (value: number) => string,
) => {
  const resolvePrice = (item: (typeof items)[number]) =>
    getEffectiveCatalogPriceForQuantity(
      item.price,
      item.promotionPrice,
      item.wholesalePrices,
      item.quantity,
      item.wholesalePrice,
      item.wholesaleMinQuantity,
    );

  const hasQuotableItems = items.some((item) => !resolvePrice(item));
  const pricedTotal = items.reduce((sum, item) => sum + (resolvePrice(item) ?? 0) * item.quantity, 0);

  if (!hasQuotableItems) return formatter(pricedTotal);
  if (pricedTotal <= 0) return CATALOG_QUOTABLE_LABEL;
  return `${formatter(pricedTotal)} + cotizables`;
};
