import assert from "node:assert/strict";
import { MoreModulePage } from "../../../../src/new/systems/pos/features/more/pages/MoreModulePage";
import { MoreModuleService } from "../../../../src/new/systems/pos/features/more/services/MoreModuleService";
import { MORE_MODULE_SECTIONS } from "../../../../src/new/systems/pos/features/more/config/moreModules";

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

  const roles = findModule("roles");
  const printers = findModule("printers");
  const branches = findModule("branches");
  assert.equal(roles.actionType, "beta-action");
  assert.equal(printers.actionType, "beta-action");
  assert.equal(branches.actionType, "beta-action");

  let failed = false;
  try {
    await page.execute("business", "Información del negocio", { token: "", businessId: 1, employeeId: 1 });
  } catch {
    failed = true;
  }
  assert.equal(failed, true, "must fail without token");
}
