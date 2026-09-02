import assert from "node:assert/strict";
import { CATALOG_AI_BATCH_LIMIT, getCatalogAiImportQuota } from "../../../../src/new/systems/pos/features/products/config/catalogAiPlanAccess";

export const run = async () => {
  assert.equal(CATALOG_AI_BATCH_LIMIT, 50);
  assert.equal(getCatalogAiImportQuota("GRATUITO"), 0);
  assert.equal(getCatalogAiImportQuota("START"), 100);
  assert.equal(getCatalogAiImportQuota("PRO"), 250);
  assert.equal(getCatalogAiImportQuota("MAX"), 500);
  assert.equal(getCatalogAiImportQuota("MAX", "START"), 100);
};
