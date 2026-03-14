import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const TARGETS = ["src/app", "src/features"];
const EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx"]);
const FORBIDDEN = /from\s+["'][^"']*Components\//g;

const walk = (dir, files = []) => {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      walk(fullPath, files);
      continue;
    }

    const ext = fullPath.slice(fullPath.lastIndexOf("."));
    if (EXTENSIONS.has(ext)) {
      files.push(fullPath);
    }
  }

  return files;
};

const violations = [];

for (const target of TARGETS) {
  const files = walk(join(ROOT, target));

  for (const file of files) {
    const content = readFileSync(file, "utf8");
    if (FORBIDDEN.test(content)) {
      violations.push(relative(ROOT, file));
    }
  }
}

if (violations.length > 0) {
  console.error("❌ Se detectaron imports directos a src/Components en app/features:\n");
  for (const file of violations) {
    console.error(` - ${file}`);
  }
  process.exit(1);
}

console.log("✅ Sin imports directos a src/Components en src/app ni src/features.");
