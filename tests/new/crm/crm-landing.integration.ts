import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export async function run(): Promise<void> {
  const root = process.cwd();
  const routes = readFileSync(resolve(root, "src/new/routing/NewAppRoutes.tsx"), "utf8");
  const page = readFileSync(resolve(root, "src/new/systems/crm-ravekh/pages/CrmLandingPage.tsx"), "utf8");
  const sitemap = readFileSync(resolve(root, "public/sitemap.xml"), "utf8");
  const privacyPage = readFileSync(resolve(root, "src/new/systems/legal/pages/PrivacyPolicyPage.tsx"), "utf8");

  assert.match(routes, /path="\/crm"/);
  assert.match(routes, /RAVEKH CRM \| Gestión de clientes y conversaciones de WhatsApp/);
  assert.match(page, /Producto en desarrollo/);
  assert.match(page, /\/politicas\/ravekh-crm/);
  assert.match(page, /\/terminos\/ravekh-crm/);
  assert.match(page, /wa\.me\/525653989702/);
  assert.doesNotMatch(page, /524451113370/);
  assert.match(page, /to="\/maincatalogo">RAVEKH POS/);
  assert.match(privacyPage, /policySlug === "ravekh-crm" \? "\/crm"/);
  assert.match(sitemap, /https:\/\/ravekh\.com\/crm/);
}
