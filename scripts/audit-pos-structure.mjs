import { readdirSync, statSync, existsSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const posRoot = join(root, 'src', 'features', 'pos');
const reportPath = join(root, 'docs', 'pos-structure-audit.md');

const rootFeatureFolders = new Set(['hooks', 'interface', 'model', 'page', 'service']);
const requiredFeatureFolders = ['hooks', 'interface', 'model', 'page', 'service', 'types'];

const isDirectory = (path) => {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
};

const posFeatureModules = readdirSync(posRoot)
  .filter((name) => isDirectory(join(posRoot, name)))
  .filter((name) => !rootFeatureFolders.has(name))
  .sort();

const moduleChecks = posFeatureModules.map((moduleName) => {
  const modulePath = join(posRoot, moduleName);
  const missingFolders = requiredFeatureFolders.filter(
    (folderName) => !existsSync(join(modulePath, folderName))
  );

  return {
    moduleName,
    missingFolders,
  };
});

const jsTsxFiles = [];

const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      jsTsxFiles.push(relative(root, fullPath));
    }
  }
};

walk(posRoot);
jsTsxFiles.sort();

const lines = [];
lines.push('# Auditoría de estructura POS');
lines.push('');
lines.push('> Reporte generado automáticamente con `node scripts/audit-pos-structure.mjs`.');
lines.push('');
lines.push('## Reglas evaluadas');
lines.push('');
lines.push('- Cada módulo de `src/features/pos/*` debería incluir: `hooks`, `interface`, `model`, `page`, `service`, `types`.');
lines.push('- Se listan archivos `.js/.jsx` para identificar pendientes de migración hacia `.ts/.tsx`.');
lines.push('');
lines.push('## Carpetas faltantes por módulo');
lines.push('');
lines.push('| Módulo | Carpetas faltantes |');
lines.push('| --- | --- |');

for (const check of moduleChecks) {
  lines.push(`| ${check.moduleName} | ${check.missingFolders.length ? check.missingFolders.join(', ') : '—'} |`);
}

lines.push('');
lines.push('## Archivos JS/JSX detectados en POS');
lines.push('');
if (!jsTsxFiles.length) {
  lines.push('- No se detectaron archivos `.js/.jsx` en `src/features/pos`.');
} else {
  for (const file of jsTsxFiles) {
    lines.push(`- ${file}`);
  }
}
lines.push('');

writeFileSync(reportPath, `${lines.join('\n')}\n`);

console.log(`Reporte escrito en: ${relative(root, reportPath)}`);
console.log('Módulos auditados:', posFeatureModules.length);
console.log('Archivos JS/JSX encontrados:', jsTsxFiles.length);
