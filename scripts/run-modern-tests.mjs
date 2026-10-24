import { mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

const projectRoot = process.cwd();
const outDir = resolve(projectRoot, ".tmp-modern-tests");

const suites = [
  { name: "unit-catalog-variant-price", entry: "tests/new/catalog/catalog.variant-price.unit.ts" },
  { name: "unit-products-variant-removal", entry: "tests/new/pos/products/products.variant-removal.unit.ts" },
  { name: "unit-sales-table-cart", entry: "tests/new/pos/sales/sales.table-cart.unit.ts" },
  { name: "unit-sale-ticket", entry: "tests/new/pos/sales/sale-ticket.unit.ts" },
  { name: "unit-finance-report-branch", entry: "tests/new/pos/reporting/finance-report-branch.unit.ts" },
  { name: "unit-sales-variant-availability", entry: "tests/new/pos/sales/sales.variant-availability.unit.ts" },
  { name: "unit-catalog-ai-api", entry: "tests/new/pos/products/catalog-ai-api.unit.ts" },
  { name: "unit-crm-status", entry: "tests/new/pos/crm/crm-status.unit.ts" },
  { name: "unit-reporting-reprint", entry: "tests/new/pos/reporting/reporting.reprint.unit.ts" },
  { name: "unit-loyalty-feature-access", entry: "tests/new/pos/loyalty/feature-access.unit.ts" },
  { name: "unit-dynamic-qr", entry: "tests/new/pos/loyalty/dynamic-qr.unit.ts" },
  { name: "unit-printer-format", entry: "tests/new/pos/parity/printer-format.unit.ts" },
  { name: "unit-pos-theme", entry: "tests/new/pos/parity/pos-theme.unit.ts" },
  { name: "unit-cash-closing-parity", entry: "tests/new/pos/parity/cash-closing-parity.unit.ts" },
  { name: "unit-mobile-parity", entry: "tests/new/pos/parity/mobile-parity.unit.ts" },
  { name: "unit-http-idempotency", entry: "tests/new/core/http-idempotency.unit.ts" },
  { name: "integration-crm-landing", entry: "tests/new/crm/crm-landing.integration.ts" },
  { name: "unit-login-session-limit", entry: "tests/new/pos/auth/login-session-limit.unit.ts" },
  { name: "unit-products-service", entry: "tests/new/pos/products/products.service.unit.ts" },
  { name: "unit-products-discontinued", entry: "tests/new/pos/products/products.discontinued.unit.ts" },
  { name: "unit-catalog-ai-plan-access", entry: "tests/new/pos/products/catalog-ai-plan-access.unit.ts" },
  { name: "unit-product-image-plan-access", entry: "tests/new/pos/products/product-image-plan-access.unit.ts" },
  { name: "unit-catalog-ai-wholesale-prices", entry: "tests/new/pos/products/catalog-ai-wholesale-prices.unit.ts" },
  { name: "integration-products-api-service-page", entry: "tests/new/pos/products/products.integration.ts" },
  { name: "integration-finance-api", entry: "tests/new/pos/finance/finance.api.integration.ts" },
  { name: "unit-more-module-page", entry: "tests/new/pos/more/more.module.page.unit.ts" },
  { name: "integration-branding-api", entry: "tests/new/pos/branding/branding.api.integration.ts" },
  { name: "integration-business-settings-api", entry: "tests/new/pos/business/business-settings.api.integration.ts" },
  { name: "integration-reporting-api", entry: "tests/new/pos/reporting/reporting.api.integration.ts" },
  { name: "unit-reporting-aggregation", entry: "tests/new/pos/reporting/reporting.aggregation.unit.ts" },
  { name: "integration-dashboard-api", entry: "tests/new/pos/reporting/dashboard.api.integration.ts" },
  { name: "unit-online-orders-page", entry: "tests/new/pos/online-orders/online-orders.page.unit.ts" },
  { name: "unit-online-orders-api", entry: "tests/new/pos/online-orders/online-orders.api.unit.ts" },
  { name: "integration-inventory-api", entry: "tests/new/pos/inventory/inventory.api.integration.ts" },
  { name: "integration-sales-pagination-api", entry: "tests/new/pos/sales/sales.pagination.integration.ts" },
  { name: "unit-sales-stock", entry: "tests/new/pos/sales/sales.stock.unit.ts" },
  { name: "unit-cart-stock", entry: "tests/new/pos/sales/cart-stock.unit.ts" },
  { name: "integration-loyalty-api", entry: "tests/new/pos/loyalty/loyalty.api.integration.ts" },
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
    loader: {
      ".svg": "dataurl",
      ".png": "dataurl",
      ".jpg": "dataurl",
      ".jpeg": "dataurl",
      ".webp": "dataurl",
      ".css": "text",
    },
    define: {
      "import.meta.env": "{}",
    },
  });

  const mod = await import(pathToFileURL(outfile).href);
  if (typeof mod.run !== "function") {
    throw new Error(`Suite ${suite.name} does not export run()`);
  }
  await mod.run();
  console.log(`PASS ${suite.name}`);
}

console.log("All modern POS tests passed.");
