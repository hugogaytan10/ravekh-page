import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, normalize, resolve } from "node:path";
import { globSync } from "glob";

const FORBIDDEN_IMPORT_PATTERNS = [
  /^Components\//,
  /^systems\//,
  /^assets\/POS\//,
  /(^|\/)src\/Components\//,
  /(^|\/)src\/systems\//,
  /(^|\/)src\/assets\/POS\//,
];

const NEW_RUNTIME_ENTRYPOINTS = ["src/App.jsx", "src/main.jsx"];
const ALLOWED_RUNTIME_IMPORTS = new Set(["src/main.jsx -> ./App.jsx"]);

export async function run(): Promise<void> {
  const root = resolve(process.cwd());
  const files = globSync("src/new/**/*.{ts,tsx,js,jsx}", {
    cwd: root,
    nodir: true,
    ignore: ["**/*.d.ts"],
  });
  const checkedFiles = [...files, ...NEW_RUNTIME_ENTRYPOINTS];

  const violations = checkedFiles.flatMap((file) => {
    const content = readFileSync(resolve(root, file), "utf8");
    const imports = Array.from(content.matchAll(/(?:from\s+|import\s*\()\s*["']([^"']+)["']/g)).map((entry) => entry[1]);
    const fileViolations: string[] = [];

    for (const value of imports) {
      if (FORBIDDEN_IMPORT_PATTERNS.some((pattern) => pattern.test(value))) {
        fileViolations.push(`${file} -> ${value}`);
        continue;
      }

      if (value.startsWith(".")) {
        if (ALLOWED_RUNTIME_IMPORTS.has(`${file} -> ${value}`)) {
          continue;
        }
        const resolvedImport = normalize(resolve(root, dirname(file), value)).replaceAll("\\", "/");
        if (!resolvedImport.includes("/src/new/")) {
          fileViolations.push(`${file} -> ${value}`);
        }
      }
    }

    return fileViolations;
  });

  assert.deepEqual(violations, [], `Found forbidden imports in src/new: ${violations.join(", ")}`);
}
