import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const featureName = process.argv[2];

if (!featureName) {
  console.error("Uso: npm run feature:new -- <feature-name>");
  process.exit(1);
}

const isValidName = /^[a-z0-9-]+$/.test(featureName);

if (!isValidName) {
  console.error("El nombre de la feature debe estar en kebab-case (a-z, 0-9, guion).");
  process.exit(1);
}

const featureRoot = join(process.cwd(), "src", "features", featureName);

if (existsSync(featureRoot)) {
  console.error(`La feature \"${featureName}\" ya existe en src/features.`);
  process.exit(1);
}

const folders = ["hooks", "interface", "model", "page", "service"];

for (const folder of folders) {
  mkdirSync(join(featureRoot, folder), { recursive: true });
  writeFileSync(join(featureRoot, folder, ".gitkeep"), "");
}

const indexContent = [
  "// API pública de la feature.",
  "// Exporta aquí únicamente lo necesario para el resto de la app.",
  "",
].join("\n");

writeFileSync(join(featureRoot, "index.js"), indexContent);

console.log(`Feature creada: src/features/${featureName}`);
