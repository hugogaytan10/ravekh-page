export const clampSaleQuantityToStock = (
  quantity: number,
  stock: number | null,
): number => {
  const normalizedQuantity = Number.isFinite(quantity)
    ? Math.max(0, Math.floor(quantity))
    : 0;

  return stock === null
    ? normalizedQuantity
    : Math.min(normalizedQuantity, Math.max(0, Math.floor(stock)));
};
