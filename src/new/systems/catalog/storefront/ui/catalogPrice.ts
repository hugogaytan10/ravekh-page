export const CATALOG_QUOTABLE_LABEL = "Cotizable";

export const getCatalogPriceValue = (value: unknown) => {
  const price = Number(value);
  return Number.isFinite(price) && price > 0 ? price : null;
};

export const getEffectiveCatalogPrice = (price: unknown, promotionPrice?: unknown) =>
  getCatalogPriceValue(promotionPrice) ?? getCatalogPriceValue(price);

export const getWholesaleCatalogPrice = (wholesalePrice: unknown, wholesaleMinQuantity: unknown, quantity: unknown) => {
  const price = getCatalogPriceValue(wholesalePrice);
  const minQuantity = Number(wholesaleMinQuantity);
  const parsedQuantity = Number(quantity);
  if (!price || !Number.isFinite(minQuantity) || minQuantity < 2 || !Number.isFinite(parsedQuantity)) return null;
  return parsedQuantity >= minQuantity ? price : null;
};

export const getEffectiveCatalogPriceForQuantity = (
  price: unknown,
  promotionPrice: unknown,
  wholesalePrice: unknown,
  wholesaleMinQuantity: unknown,
  quantity: unknown,
) => getWholesaleCatalogPrice(wholesalePrice, wholesaleMinQuantity, quantity) ?? getEffectiveCatalogPrice(price, promotionPrice);

export const formatCatalogPrice = (value: unknown, formatter: (value: number) => string) => {
  const price = getCatalogPriceValue(value);
  return price ? formatter(price) : CATALOG_QUOTABLE_LABEL;
};

export const formatCatalogTotal = (
  items: Array<{ price?: unknown; promotionPrice?: unknown; wholesalePrice?: unknown; wholesaleMinQuantity?: unknown; quantity: number }>,
  formatter: (value: number) => string,
) => {
  const hasQuotableItems = items.some((item) => !getEffectiveCatalogPriceForQuantity(item.price, item.promotionPrice, item.wholesalePrice, item.wholesaleMinQuantity, item.quantity));
  const pricedTotal = items.reduce((sum, item) => sum + (getEffectiveCatalogPriceForQuantity(item.price, item.promotionPrice, item.wholesalePrice, item.wholesaleMinQuantity, item.quantity) ?? 0) * item.quantity, 0);

  if (!hasQuotableItems) return formatter(pricedTotal);
  if (pricedTotal <= 0) return CATALOG_QUOTABLE_LABEL;
  return `${formatter(pricedTotal)} + cotizables`;
};
