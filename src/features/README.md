# Arquitectura basada en features

Este directorio permite migrar el proyecto **de forma gradual** sin romper el flujo actual de `src/Components`.

## Objetivo

Mantener la app funcionando mientras cada dominio nuevo (o refactor) vive dentro de `src/features/<feature-name>` con una estructura consistente y mantenible.

## Estructura estándar por feature

```text
src/features/
  <feature-name>/
    hooks/
    interface/
    model/
    page/
    service/
    index.js
```

### Responsabilidades por carpeta

- `page/`: contenedores de pantalla/ruta (composición de la feature).
- `interface/`: UI presentacional, sin lógica de negocio compleja.
- `service/`: API clients, adaptadores, mapeos de datos, utilidades de infraestructura.
- `model/`: tipos, modelos, constantes y reglas de dominio.
- `hooks/`: hooks específicos de la feature.
- `index.js`: API pública de la feature (único punto de exportación externo).

## Separación por sistemas de negocio

Para los dominios más grandes (cupones/visitas, catálogo web y POS), ahora existe una capa de fachada en `src/features/systems`:

```text
src/features/systems/
  coupon-visits/
  catalog-web/
  pos/
  model/systemsRegistry.js
  page/systemRoutes.js
  index.js
```

### ¿Qué resuelve esta capa?

- Declara explícitamente los sistemas activos del negocio.
- Permite centralizar rutas multi-feature (`systemRoutes`).
- Evita que `app/router` deba importar cada sistema de forma aislada.
- Facilita migración gradual sin renombrar ni mover todo de golpe.

## Avance actual sugerido

- Mantener wrappers legacy en `src/Components/*` que delegan en `features/*/page/*`.
- Mover primero UI legado a `interface/` (como adaptadores), y dejar `page/` solo para composición/ruta.
- Después, extraer datos y reglas a `service/` y `model/` para terminar de desacoplar cada feature.

## Entry paralelo para migración

- `npm run dev`: mantiene el flujo legacy actual.
- `npm run new`: levanta el entry paralelo (`src/new-main.jsx`) para validar rutas migradas por features sin romper lo existente.

## Estrategia de migración incremental

1. **Congelar rutas legacy**: no mover todo de golpe.
2. **Crear una feature por cada dominio nuevo o refactor aislado**.
3. **Usar wrappers de compatibilidad** en `src/Components` cuando aplique.
4. **Migrar por capas** en este orden:
   - `model` y `service`
   - `hooks`
   - `interface`
   - `page`
5. **Actualizar imports** para depender de `features/<feature>/index.js`.
6. **Eliminar código legacy** solo cuando no existan referencias activas.

## Buenas prácticas clave

- Evitar imports cruzados entre features.
- Si algo es compartido, promoverlo a una zona común (`shared/` o `app/`).
- No mezclar lógica de UI con acceso a datos.
- Mantener `service` sin dependencias de React/UI.
- Minimizar side effects dentro de componentes presentacionales.
- Para sistemas grandes, usar `features/systems/*` como punto de coordinación y no como lugar para lógica UI.

## Definición de terminado (DoD) por migración

- [ ] Existe `index.js` como API pública.
- [ ] La feature compila sin dependencias cíclicas.
- [ ] La ruta legacy sigue funcionando (si aplica).
- [ ] Se validó `npm run lint`.
- [ ] Se validó `npm run build`.
- [ ] Se documentó alcance y riesgos en el PR.

## Scaffold rápido

Puedes crear una feature base con:

```bash
npm run feature:new -- nombre-feature
# alias corto
npm run new -- nombre-feature
```

Esto evita inconsistencias de estructura y acelera migraciones pequeñas por dominio.

### Progreso de migración POS (actual)

- ✅ Autenticación POS (`/login-punto-venta`) ya corre desde `src/features/pos`.
- ✅ Servicio de autenticación centralizado en `src/features/pos/service/posAuthService.ts`.
- ✅ Wrapper legacy mantenido en `src/Components/CatalogoWeb/PuntoVenta/Login/*` para no romper rutas existentes.
- ✅ Rutas principales de ventas POS (`MainSales`, `MainCart`, checkout y flujos de scanner/búsqueda) ya delegan a páginas de `src/features/pos` manteniendo componentes legacy como adaptadores internos.
- 🔜 Siguiente paso recomendado: mover `create-store`, `sales` y `settings` con el mismo patrón (`page/interface/service/model/hooks`).
