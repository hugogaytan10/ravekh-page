import { mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

const projectRoot = process.cwd();
const outDir = resolve(projectRoot, ".tmp-modern-tests");

const suites = [
  { name: "unit-products-service", entry: "tests/new/pos/products/products.service.unit.ts" },
  { name: "integration-products-api-service-page", entry: "tests/new/pos/products/products.integration.ts" },
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
