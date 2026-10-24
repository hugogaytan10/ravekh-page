import assert from "node:assert/strict";
import {
  formatRemainingStock,
  getStockLimitMessage,
} from "../../../../src/new/systems/pos/features/sales/model/cartStock";

export const run = async () => {
  assert.equal(formatRemainingStock(1), "Queda 1 unidad");
  assert.equal(formatRemainingStock(4), "Quedan 4 unidades");
  assert.equal(getStockLimitMessage(null, 999), null);
  assert.equal(getStockLimitMessage(3, 3), null);
  assert.equal(getStockLimitMessage(3, 4), "Quedan 3 unidades disponibles.");
};
