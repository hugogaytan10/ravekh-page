import assert from "node:assert/strict";
import { parseWholesalePrices } from "../../../../src/new/systems/pos/features/products/ui/CatalogAiImportWizard";

export const run = async () => {
  assert.deepEqual(
    parseWholesalePrices(
      [
        { key: "ten", price: "80", minQuantity: "10" },
        { key: "five", price: "90.125", minQuantity: "5" },
      ],
      100,
    ),
    [
      { price: 90.13, minQuantity: 5 },
      { price: 80, minQuantity: 10 },
    ],
  );

  assert.throws(
    () => parseWholesalePrices([{ key: "invalid", price: "120", minQuantity: "2" }], 100),
    /no puede superar el precio normal/,
  );
  assert.throws(
    () => parseWholesalePrices([
      { key: "one", price: "90", minQuantity: "5" },
      { key: "two", price: "80", minQuantity: "5" },
    ], 100),
    /No puedes repetir/,
  );
};
