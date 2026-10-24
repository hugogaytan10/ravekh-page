import assert from "node:assert/strict";
import {isVariantAvailableForSale} from "../../../../src/new/systems/pos/features/sales/model/variantAvailability";
import {PosProductApi} from "../../../../src/new/systems/pos/features/sales/api/PosProductApi";

export const run = async () => {
  assert.equal(isVariantAvailableForSale({Available: 0}), false);
  assert.equal(isVariantAvailableForSale({Available: false}), false);
  assert.equal(isVariantAvailableForSale({Available: 1}), true);
  assert.equal(isVariantAvailableForSale({}), true);
  const api = new PosProductApi({request: async () => [{Id: 3779, Business_Id: 1,
    Name: "Producto", Stock: 10, Price: 799,
    Variants: [
      {Id: 5824, Description: "Desactivada", Available: 0, Stock: 45},
      {Id: 5825, Description: "Activa", Available: 1, Stock: 45},
    ],
  }]} as any);
  const products = await api.listByBusiness(1, "token");
  assert.deepEqual(products[0].variants.map(variant => variant.id), [5825]);
};
