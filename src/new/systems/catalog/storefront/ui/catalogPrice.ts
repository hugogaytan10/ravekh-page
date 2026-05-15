export const CATALOG_QUOTABLE_LABEL = "Cotizable";

export const getCatalogPriceValue = (value: unknown) => {
  const price = Number(value);
  return Number.isFinite(price) && price > 0 ? price : null;
};

export const getEffectiveCatalogPrice = (price: unknown, promotionPrice?: unknown) =>
  getCatalogPriceValue(promotionPrice) ?? getCatalogPriceValue(price);

export const formatCatalogPrice = (value: unknown, formatter: (value: number) => string) => {
  const price = getCatalogPriceValue(value);
  return price ? formatter(price) : CATALOG_QUOTABLE_LABEL;
};

export const formatCatalogTotal = (items: Array<{ price?: unknown; quantity: number }>, formatter: (value: number) => string) => {
  const hasQuotableItems = items.some((item) => !getCatalogPriceValue(item.price));
  const pricedTotal = items.reduce((sum, item) => sum + (getCatalogPriceValue(item.price) ?? 0) * item.quantity, 0);

  if (!hasQuotableItems) return formatter(pricedTotal);
  if (pricedTotal <= 0) return CATALOG_QUOTABLE_LABEL;
  return `${formatter(pricedTotal)} + cotizables`;
};
