# Análisis de limpieza post-migración (legacy vs features)

> Fecha: 2026-03-13
> Base evaluada: coexistencia entre `src/Components` (legacy) y `src/features`.

## Resumen ejecutivo

Actualmente **todavía no es seguro borrar en bloque** los archivos legacy.
La migración por features avanzó, pero varias features siguen actuando como *wrappers* de componentes legacy.

Conclusión práctica:

1. **Sí falta trabajo** antes de eliminar `src/Components` en dominios críticos (especialmente POS).
2. **Sí hay elementos en features que conviene depurar/consolidar**, pero después de cerrar rutas duplicadas y wrappers.

## Hallazgos clave

### 1) La app principal sigue corriendo por el router legacy

- `src/main.jsx` monta `App`.
- `src/App.jsx` usa `BrowserRouter` + `Rutas` (legacy).
- El router por features vive en `src/new-main.jsx` y `src/app/router/AppRouter.tsx` (entry paralelo).

Implicación: borrar legacy hoy rompería el flujo principal de producción si no se migra el entry por defecto.

### 2) POS aún está en convivencia fuerte (legacy + feature)

Se ejecutaron auditorías existentes del repo:

- `npm run pos:audit`
- `npm run pos:coexistence-audit`

Resultado principal:

- POS legacy presente y POS feature presente.
- Rutas duplicadas detectadas: `/RavekhPos`, `/sistema/pos`, `/sistema/pos/login`.
- El router legacy importa muchas piezas de POS legacy y también algunas rutas feature.

Implicación: antes de borrar archivos legacy de POS, primero hay que resolver ownership de rutas y dejar una sola fuente de verdad por path.

### 3) Muchas features todavía importan `src/Components/*`

Se detectan dependencias directas desde features hacia legacy en:

- `features/pos` (múltiples submódulos: sales, products, reports, settings, etc.).
- `features/catalog-web` (páginas que delegan a componentes legacy).
- `features/blog` (vistas que envuelven componentes legacy del blog).
- `features/contact` (input y constantes de red desde legacy).
- `features/coupons` y `features/coupon-visits`.

Implicación: no es momento de borrar esas piezas legacy porque siguen siendo runtime dependencies.

### 4) Duplicación funcional entre `coupon-visits` y `coupons`

- `coupon-visits/page/CouponVisitsFeatureRoutes.jsx` reexporta rutas de `features/coupons`.
- Existen dos nombres para el mismo dominio funcional.

Implicación: hay deuda de naming/estructura; conviene consolidar en un solo módulo público (manteniendo alias temporal si se requiere compatibilidad).

## Qué sí se puede hacer ya (sin riesgo alto)

1. **Congelar nuevas referencias a legacy** desde features.
2. **Definir “owner de ruta” por dominio** (legacy o feature) y eliminar duplicados de registro.
3. **Mantener wrappers explícitos** con etiqueta `TODO(migration)` y fecha objetivo.
4. **Consolidar naming de cupones** (`coupon-visits` vs `coupons`) para reducir ambigüedad.

### Avance aplicado

- `features/coupon-visits` ahora reutiliza la implementación de rutas de `features/coupons` y mantiene
  una API de compatibilidad para evitar ruptura de imports mientras se completa el renombrado.

## Checklist recomendado antes de borrar legacy

### Fase A — Estabilizar rutas

- [ ] Unificar ruta principal por dominio en un solo router activo.
- [ ] Mantener redirecciones compatibles para rutas antiguas (sin doble registro de componente).
- [ ] Probar navegación end-to-end de POS, cupones y catálogo.

### Fase B — Quitar wrappers gradualmente

- [ ] En cada feature, reemplazar imports de `src/Components/*` por implementación local en `features/<dominio>/interface`.
- [ ] Mover constantes/modelos de negocio heredados a `features/<dominio>/model` o `shared`.
- [ ] Mover servicios heredados a `features/<dominio>/service`.

### Fase C — Limpieza definitiva

- [ ] Buscar referencias residuales a `src/Components/...`.
- [ ] Si no hay referencias, borrar carpeta legacy del dominio migrado.
- [ ] Ejecutar `npm run lint`, `npm run build` y smoke tests de rutas.

## Recomendación sobre “eliminar elementos de las features”

Sí, pero de forma selectiva:

1. **Consolidar features duplicadas de cupones** en una sola API pública (quitar duplicación conceptual).
2. **Evitar mantener aliases permanentes** si ya no hay consumidores reales.
3. **No borrar wrappers dentro de features todavía** cuando siguen referenciando componentes legacy activos.

En resumen: hoy la prioridad no es borrar masivamente, sino **terminar desacoples + unificar rutas + consolidar nombres**. Después de eso, la limpieza será segura y rápida.
