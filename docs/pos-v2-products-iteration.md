# POS v2 Products Iteration (Incremental Modernization)

## Decisiones técnicas

- Se implementó una feature real de `products` en arquitectura moderna (`API -> Service -> Page -> React Screen`) bajo `src/new/systems/pos/features/products/**`.
- Se agregó una feature auxiliar `health` para validar disponibilidad API desde `/v2/pos/health`.
- Se incorporó entrypoint `/pos` con toggle de ruteo `legacy|modern` persistido en `localStorage`.
- El modo `legacy` redirige a `/MainSales`; el modo `modern` redirige a `/v2/pos/products`.
- La UI v2 de productos permite listar, crear y archivar productos reales contra API POS.

## Mapa de rutas (legacy vs v2)

### Legacy (sin cambios)

- `/MainSales`
- `/main-products/*`
- `/main-reports`
- `/more`
- `/dashboard`
- `/MainFinances`
- `/clients`
- `/employees`

### Entrada unificada POS

- `/pos` (respeta toggle de modo)
  - `/pos?mode=legacy`
  - `/pos?mode=modern`

### V2 POS

- `/v2/pos` (default a products)
- `/v2/pos/products`
- `/v2/pos/health`

## Checklist de independencia legacy

- [x] No se importó `src/Components/**` dentro de `src/new/**` nuevo.
- [x] No se reutilizó lógica legacy por import directo en la nueva feature.
- [x] La nueva ruta `/v2/pos/products` usa sólo capas modernas.
- [x] Rutas legacy existentes permanecen operativas.
- [x] Se agregaron pruebas unitarias, de integración y de desacoplamiento.

## Rollback

1. Forzar temporalmente `/pos?mode=legacy` en navegación principal.
2. Eliminar rutas `/v2/pos/*` del catálogo si hay incidente.
3. Mantener backend y contratos sin cambios (rollback front-only).
4. Revertir commit de esta iteración para regresar a estado anterior.

## Definición de Done

- [x] Feature real de products v2 expuesta bajo `/v2/pos/products`.
- [x] API, service y page conectados con flujo end-to-end.
- [x] Toggle `/pos` funcionando para `legacy|modern`.
- [x] No-regresión de desacoplamiento validada por test automático.
- [x] Documentación de rutas, riesgos y rollback actualizada.
