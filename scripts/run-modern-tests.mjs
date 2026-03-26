import { mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

const projectRoot = process.cwd();
const outDir = resolve(projectRoot, ".tmp-modern-tests");

const suites = [
  { name: "unit-products-service", entry: "tests/new/pos/products/products.service.unit.ts" },
  { name: "integration-products-api-service-page", entry: "tests/new/pos/products/products.integration.ts" },
  { name: "integration-finance-api", entry: "tests/new/pos/finance/finance.api.integration.ts" },
  { name: "unit-more-module-page", entry: "tests/new/pos/more/more.module.page.unit.ts" },
  { name: "integration-reporting-api", entry: "tests/new/pos/reporting/reporting.api.integration.ts" },
  { name: "integration-dashboard-api", entry: "tests/new/pos/reporting/dashboard.api.integration.ts" },
  { name: "unit-online-orders-page", entry: "tests/new/pos/online-orders/online-orders.page.unit.ts" },
  { name: "integration-inventory-api", entry: "tests/new/pos/inventory/inventory.api.integration.ts" },
  { name: "integration-sales-pagination-api", entry: "tests/new/pos/sales/sales.pagination.integration.ts" },
  { name: "decoupling-no-legacy-imports", entry: "tests/new/architecture/decoupling.no-legacy-imports.ts" },
];

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (const suite of suites) {
  const outfile = resolve(outDir, `${suite.name}.mjs`);

  await build({
    entryPoints: [resolve(projectRoot, suite.entry)],
    outfile,
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node20",
    sourcemap: false,
    logLevel: "silent",
  });

  const mod = await import(pathToFileURL(outfile).href);
  if (typeof mod.run !== "function") {
    throw new Error(`Suite ${suite.name} does not export run()`);
  }
  await mod.run();
  console.log(`PASS ${suite.name}`);
}

console.log("All modern POS tests passed.");
