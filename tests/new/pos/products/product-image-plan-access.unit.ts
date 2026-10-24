import assert from "node:assert/strict";
import { getProductImageLimit } from "../../../../src/new/systems/pos/shared/config/posPlanAccess";

export const run = async () => {
  assert.equal(getProductImageLimit("GRATUITO"), 1);
  assert.equal(getProductImageLimit("START"), 3);
  assert.equal(getProductImageLimit("EMPRENDEDOR"), 3);
  assert.equal(getProductImageLimit("PRO"), 10);
  assert.equal(getProductImageLimit("MAX"), Infinity);
};
