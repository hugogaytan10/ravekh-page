import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const TARGETS = ["src/features/pos", "src/features/systems/pos"];
const EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx"]);
const COMPONENTS_IMPORT_RE = /from\s+["'][^"']*(src\/)?Components\//g;

const collectFiles = (targetPath) => {
  const stats = statSync(targetPath);
  if (!stats.isDirectory()) {
    return [targetPath];
  }

  const files = [];

  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry);
      const entryStats = statSync(fullPath);

      if (entryStats.isDirectory()) {
        walk(fullPath);
        continue;
      }

      const ext = fullPath.slice(fullPath.lastIndexOf("."));
      if (EXTENSIONS.has(ext)) {
        files.push(fullPath);
      }
    }
  };

  walk(targetPath);
  return files;
};

const violations = [];

for (const target of TARGETS) {
  const absoluteTarget = join(ROOT, target);
  const files = collectFiles(absoluteTarget);

  for (const file of files) {
    const content = readFileSync(file, "utf8");
    if (COMPONENTS_IMPORT_RE.test(content)) {
      violations.push(relative(ROOT, file));
    }
  }
}

if (violations.length > 0) {
  console.error("❌ POS moderno aún importa src/Components directo:\n");
  for (const file of violations) {
    console.error(` - ${file}`);
  }
  process.exit(1);
}

console.log("✅ POS moderno sin imports directos hacia src/Components.");
