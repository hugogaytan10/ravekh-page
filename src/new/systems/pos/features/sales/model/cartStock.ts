export const formatRemainingStock = (stock: number): string =>
  stock === 1 ? "Queda 1 unidad" : `Quedan ${stock} unidades`;

export const getStockLimitMessage = (
  stock: number | null,
  requestedQuantity: number,
): string | null =>
  stock !== null && requestedQuantity > stock
    ? `${formatRemainingStock(stock)} disponibles.`
    : null;
