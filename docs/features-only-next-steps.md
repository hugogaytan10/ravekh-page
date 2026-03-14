# Plan de ejecución: retirar legacy y quedarnos en la estructura nueva

Este plan convierte la meta de "features-only" en pasos operativos para que `src/Components` desaparezca por dominios, con foco en que los sistemas vivan en la capa nueva (`src/features/systems`).

## Objetivo final

- El entry principal (`npm run dev`) usa router de features/systems.
- No hay imports activos a `src/Components/*`.
- `src/legacy/*` queda vacío o eliminado.

## Estado actual de avance

- ✅ `src/main.jsx` ya renderiza `src/app` (`AppProviders` + `RouterProvider`) en lugar de `src/App.jsx` legacy.
- ⏳ Sigue pendiente eliminar dependencias a `src/legacy/*` (por ejemplo providers/adaptadores temporales).

## Estructura objetivo para sistemas

```txt
src/features/systems/
  coupon-visits/
  catalog-web/
  pos/
  model/systemsRegistry.js
  page/systemRoutes.js
  index.js
```

Regla: `app/router` solo consume `features/systems` (fachada), no internals legacy.

## Pasos siguientes (en orden recomendado)

### 1) Congelar y auditar ownership de rutas

1. Levantar inventario de rutas actuales por dominio (legacy vs feature).
2. Marcar duplicadas y elegir dueño final por path.
3. Bloquear nuevas rutas en `src/Components`.

Comandos de validación base:

```bash
npm run pos:audit
npm run pos:coexistence-audit
npm run features:boundaries
```

### 2) Completar cada sistema en su estructura nueva

Para **cada** sistema (`coupon-visits`, `catalog-web`, `pos`):

1. Confirmar capas mínimas activas (`model/service/hooks/interface/page`).
2. Exponer solo API pública por `index.js`.
3. Mover dependencias de wrappers legacy a `service/model` nativos.
4. Registrar rutas únicamente desde `features/systems/*`.

Criterio por sistema: cero imports a `src/Components/*` y cero imports a `src/legacy/*` en runtime.

### 3) Cortar convivencia legacy por dominio

1. Reemplazar en router principal cada ruta legacy por su ruta de sistema en `features/systems/page/systemRoutes.js`.
2. Eliminar wrappers legacy del dominio ya migrado.
3. Re-ejecutar auditorías y smoke test del dominio.

Repetir hasta cubrir los 3 sistemas.

### 4) Cierre de entrypoint y convergencia

1. ✅ `src/main.jsx` ya no pasa por `src/App.jsx`/`src/Components/Rutas/Rutas.jsx`.
2. Verificar que `npm run dev` y `npm run new` compartan el mismo grafo de rutas (o retirar `new` cuando deje de aportar validación).
3. Retirar dependencias remanentes a `src/legacy/*` desde providers y rutas del entry principal.

### 5) Remoción final de legacy

1. Eliminar `src/legacy/*` sin consumidores.
2. Eliminar `src/Components/*` sin consumidores.
3. Remover scripts/documentación de coexistencia que ya no apliquen.

## Checklist de Definition of Done (por dominio)

- [ ] Ruta(s) del dominio registradas solo en `features/*` o `features/systems/*`.
- [ ] Sin imports a `src/Components/*`.
- [ ] Sin imports a `src/legacy/*`.
- [ ] `npm run features:boundaries` en verde.
- [ ] `npm run build` en verde.
- [ ] Smoke test manual del flujo crítico.

## Comandos de verificación recomendados por PR

```bash
npm run lint
npm run features:boundaries
npm run pos:audit
npm run pos:coexistence-audit
npm run build
```

> Nota: cuando se complete la migración, `pos:coexistence-audit` debería quedar obsoleto y podrá retirarse.
