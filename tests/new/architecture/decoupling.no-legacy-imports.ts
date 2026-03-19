import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { globSync } from "glob";

export async function run(): Promise<void> {
  const root = resolve(process.cwd());
  const files = globSync("src/new/systems/pos/**/*.{ts,tsx,js,jsx}", { cwd: root, nodir: true });

  const violations = files.filter((file) => {
    const content = readFileSync(resolve(root, file), "utf8");
    return /from\s+["'][^"']*Components\//.test(content) || /import\s+["'][^"']*Components\//.test(content);
  });

  assert.deepEqual(violations, [], `Found forbidden imports in src/new/systems/pos: ${violations.join(", ")}`);
}
