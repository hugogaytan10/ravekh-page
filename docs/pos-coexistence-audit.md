# Auditoría de coexistencia POS (legacy + feature)

> Reporte generado automáticamente con `node scripts/audit-pos-coexistence.mjs`.

## Estado de codebases

- Legacy POS en 'src/Components/CatalogoWeb/PuntoVenta': **presente**.
- Nuevo POS en 'src/features/pos': **presente**.
- Archivos de código legacy POS detectados: **164**.
- Archivos de código nuevo POS detectados: **113**.

## Router legacy (fuente principal actual)

- Importa POS legacy: **sí**.
- Importa POS nuevo por features: **sí**.

## Rutas POS detectadas

- Router legacy (`src/Components/Rutas/Rutas.jsx`):
  - /MainSales
  - /RavekhPos
  - /create-store
  - /login-punto-venta
  - /sistema/pos
  - /sistema/pos/login
- Feature POS (`src/features/pos/page/PosFeatureRoutes.jsx`):
  - /RavekhPos

## Riesgos de coexistencia

- Rutas duplicadas detectadas (mismo path en ambos lados):
  - /RavekhPos

## Recomendación de migración segura

1. Mantener `Rutas.jsx` como gateway mientras validan la feature nueva en paralelo.
2. Evitar registrar el mismo path en dos routers activos al mismo tiempo para no tener comportamiento no determinista.
3. Al migrar cada flujo, redirigir desde la ruta legacy al page de `src/features/pos` y luego eliminar import legacy sin uso.

