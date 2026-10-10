import assert from "node:assert/strict";
import { clampSaleQuantityToStock } from "../../../../src/new/systems/pos/features/sales/model/saleStock";

export const run = async (): Promise<void> => {
  assert.equal(clampSaleQuantityToStock(6, 5), 5);
  assert.equal(clampSaleQuantityToStock(3.9, 5), 3);
  assert.equal(clampSaleQuantityToStock(6, null), 6);
  assert.equal(clampSaleQuantityToStock(-1, 5), 0);
};
