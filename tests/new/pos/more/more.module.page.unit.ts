import assert from "node:assert/strict";
import { MoreModulePage } from "../../../../src/new/systems/pos/features/more/pages/MoreModulePage";
import { MoreModuleService } from "../../../../src/new/systems/pos/features/more/services/MoreModuleService";
import { MORE_MODULE_SECTIONS } from "../../../../src/new/systems/pos/features/more/config/moreModules";
import { POS_V2_PATHS } from "../../../../src/new/systems/pos/routing/PosV2Paths";

const findModule = (moduleId: string) => {
  const module = MORE_MODULE_SECTIONS.flatMap((section) => section.items).find((item) => item.id === moduleId);
  assert.ok(module, `module ${moduleId} must exist`);
  return module;
};

export async function run(): Promise<void> {
  const service = new MoreModuleService("https://apipos.ravekh.com/api/");
  const page = new MoreModulePage(service);

  assert.equal(page.supportsInlineExecution("business"), true);
  assert.equal(page.supportsInlineExecution("catalog-settings"), true);

  const printers = findModule("printers");
  const coupons = findModule("coupons");
  const visits = findModule("visits");
  const cashClosing = findModule("cash-closing");
  const inventory = findModule("inventory");
  const loyalty = findModule("loyalty");
  assert.equal(printers.actionType, "route");
  assert.equal(printers.status, "available");
  assert.equal(printers.description.includes("Wi"), true);
  assert.equal(coupons.actionType, "route");
  assert.equal(coupons.status, "available");
  assert.equal(visits.actionType, "route");
  assert.equal(visits.status, "available");
  assert.equal(cashClosing.path, POS_V2_PATHS.cashClosing);
  assert.equal(inventory.path, POS_V2_PATHS.inventory);
  assert.equal(inventory.actionType, "route");
  assert.equal(loyalty.path, POS_V2_PATHS.loyalty);
  assert.equal(loyalty.actionType, "route");
  const roles = MORE_MODULE_SECTIONS.flatMap((section) => section.items).find((item) => item.id === "roles");
  const branches = MORE_MODULE_SECTIONS.flatMap((section) => section.items).find((item) => item.id === "branches");
  assert.equal(roles, undefined);
  assert.equal(branches, undefined);

  let failed = false;
  try {
    await page.execute("business", "Información del negocio", { token: "", businessId: 1, employeeId: 1 });
  } catch {
    failed = true;
  }
  assert.equal(failed, true, "must fail without token");
}
