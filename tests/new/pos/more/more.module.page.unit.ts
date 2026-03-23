import assert from "node:assert/strict";
import { MoreModulePage } from "../../../../src/new/systems/pos/features/more/pages/MoreModulePage";
import { MoreModuleService } from "../../../../src/new/systems/pos/features/more/services/MoreModuleService";

export async function run(): Promise<void> {
  const service = new MoreModuleService("https://apipos.ravekh.com/api/");
  const page = new MoreModulePage(service);

  assert.equal(page.supportsInlineExecution("business"), true);
  assert.equal(page.supportsInlineExecution("catalog-settings"), false);

  let failed = false;
  try {
    await page.execute("business", "Información del negocio", { token: "", businessId: 1 });
  } catch {
    failed = true;
  }
  assert.equal(failed, true, "must fail without token");
}
