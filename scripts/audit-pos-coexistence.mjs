import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const legacyPosRoot = join(root, 'src', 'Components', 'CatalogoWeb', 'PuntoVenta');
const newPosRoot = join(root, 'src', 'features', 'pos');
const legacyRoutesFile = join(root, 'src', 'Components', 'Rutas', 'Rutas.jsx');
const newPosRoutesFile = join(root, 'src', 'features', 'pos', 'page', 'PosFeatureRoutes.jsx');
const reportPath = join(root, 'docs', 'pos-coexistence-audit.md');


const walkFiles = (dir, output = []) => {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      walkFiles(fullPath, output);
      continue;
    }

    output.push(fullPath);
  }

  return output;
};

const readRoutePathsFromJsx = (filePath) => {
  if (!existsSync(filePath)) return [];
  const content = readFileSync(filePath, 'utf-8');
  const paths = new Set();
  const routeRegex = /<Route\s+path="([^"]+)"/g;
  const aliasRegex = /path:\s*"([^"]+)"/g;

  let match;
  while ((match = routeRegex.exec(content)) !== null) {
    paths.add(match[1]);
  }
  while ((match = aliasRegex.exec(content)) !== null) {
    paths.add(match[1]);
  }

  return [...paths].sort();
};

const legacyPosExists = existsSync(legacyPosRoot);
const newPosExists = existsSync(newPosRoot);

const legacyPosFiles = legacyPosExists
  ? walkFiles(legacyPosRoot).filter((file) => /\.(js|jsx|ts|tsx)$/.test(file))
  : [];
const newPosFiles = newPosExists
  ? walkFiles(newPosRoot).filter((file) => /\.(js|jsx|ts|tsx)$/.test(file))
  : [];

const legacyRoutes = readRoutePathsFromJsx(legacyRoutesFile).filter(
  (path) => path.startsWith('/sistema/pos') || path === '/RavekhPos' || path === '/login-punto-venta' || path === '/create-store' || path === '/MainSales'
);
const newRoutes = readRoutePathsFromJsx(newPosRoutesFile).filter(
  (path) => path.startsWith('/sistema/pos') || path === '/RavekhPos'
);

const duplicateRoutes = legacyRoutes.filter((route) => newRoutes.includes(route));

const legacyRoutesContent = existsSync(legacyRoutesFile)
  ? readFileSync(legacyRoutesFile, 'utf-8')
  : '';
const usesLegacyPosImports = legacyRoutesContent.includes('../CatalogoWeb/PuntoVenta');
const usesNewPosImports = legacyRoutesContent.includes('../../features/pos');

const lines = [];
lines.push('# Auditoría de coexistencia POS (legacy + feature)');
lines.push('');
lines.push('> Reporte generado automáticamente con `node scripts/audit-pos-coexistence.mjs`.');
lines.push('');
lines.push('## Estado de codebases');
lines.push('');
lines.push(`- Legacy POS en \'src/Components/CatalogoWeb/PuntoVenta\': **${legacyPosExists ? 'presente' : 'ausente'}**.`);
lines.push(`- Nuevo POS en \'src/features/pos\': **${newPosExists ? 'presente' : 'ausente'}**.`);
lines.push(`- Archivos de código legacy POS detectados: **${legacyPosFiles.length}**.`);
lines.push(`- Archivos de código nuevo POS detectados: **${newPosFiles.length}**.`);
lines.push('');
lines.push('## Router legacy (fuente principal actual)');
lines.push('');
lines.push(`- Importa POS legacy: **${usesLegacyPosImports ? 'sí' : 'no'}**.`);
lines.push(`- Importa POS nuevo por features: **${usesNewPosImports ? 'sí' : 'no'}**.`);
lines.push('');
lines.push('## Rutas POS detectadas');
lines.push('');
lines.push('- Router legacy (`src/Components/Rutas/Rutas.jsx`):');
for (const route of legacyRoutes) {
  lines.push(`  - ${route}`);
}
lines.push('- Feature POS (`src/features/pos/page/PosFeatureRoutes.jsx`):');
for (const route of newRoutes) {
  lines.push(`  - ${route}`);
}
lines.push('');
lines.push('## Riesgos de coexistencia');
lines.push('');
if (!duplicateRoutes.length) {
  lines.push('- No se detectaron rutas duplicadas exactas entre router legacy y aliases de la feature POS.');
} else {
  lines.push('- Rutas duplicadas detectadas (mismo path en ambos lados):');
  for (const route of duplicateRoutes) {
    lines.push(`  - ${route}`);
  }
}
lines.push('');
lines.push('## Recomendación de migración segura');
lines.push('');
lines.push('1. Mantener `Rutas.jsx` como gateway mientras validan la feature nueva en paralelo.');
lines.push('2. Evitar registrar el mismo path en dos routers activos al mismo tiempo para no tener comportamiento no determinista.');
lines.push('3. Al migrar cada flujo, redirigir desde la ruta legacy al page de `src/features/pos` y luego eliminar import legacy sin uso.');
lines.push('');

writeFileSync(reportPath, `${lines.join('\n')}\n`);

console.log(`Reporte escrito en: ${relative(root, reportPath)}`);
console.log('Archivos legacy POS:', legacyPosFiles.length);
console.log('Archivos new POS:', newPosFiles.length);
console.log('Rutas duplicadas:', duplicateRoutes.length);
