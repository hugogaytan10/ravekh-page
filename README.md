# Ravekh Page

Aplicación web en React + Vite que actualmente convive entre una base **legacy** (`src/Components`) y una base moderna por **features** (`src/features`).

## Objetivo de arquitectura

Mantener el comportamiento actual en producción mientras se migra de forma incremental a una arquitectura basada en features, sin “big bang refactor”.

## Estado actual

- `src/Components`: código legacy que sigue siendo fuente principal de rutas/pantallas.
- `src/features`: nuevo espacio para módulos aislados por dominio.
- `src/features/legal`: feature migrada para políticas de privacidad.
- `src/features/blog`: feature base del blog (page/interface/hook/model/service) conectada vía wrapper legacy.
- `src/features/contact`: feature para formulario de contacto, integrada con wrapper legacy.
- `src/features/landing`: feature completa para la landing page, incluyendo secciones de muestra y paquetes, con control de colores/estilos por sección.
- `src/features/coupon-visits`: alias de compatibilidad para el dominio de cupones/visitas (la implementación canónica vive en `src/features/coupons`).
- `src/features/coupons`: implementación canónica del dominio cupones/visitas (rutas, modelos y resolución de rutas).
- `src/features/catalog-web`: feature para catálogo web con rutas de listado, detalle, categoría y pedido.
- `src/features/pos`: feature para POS con rutas base de marketing, login, creación y venta.
- `src/features/systems`: nueva capa de organización para separar sistemas de negocio (cupones/visitas, catálogo web y POS) sin romper compatibilidad.

## Estructura objetivo

```txt
src/
  features/
    <feature-name>/
      hooks/
      interface/
      model/
      page/
      service/
      index.js
```


## Desacople del proyecto por features respecto al legacy

Se agregó una capa de **adaptadores legacy** en `src/legacy/*` para que `src/app` y `src/features` no importen directamente desde `src/Components`.

- `src/features` y `src/app` ahora dependen de adaptadores (`src/legacy`) y no de rutas internas del legacy.
- Esto permite reemplazar implementaciones legacy por versiones nativas de features sin cambiar el consumo en el nuevo router.
- Puedes validar la regla con:

```bash
npm run features:boundaries
```

## Capa de sistemas (nuevo)

Para separar mejor los productos de negocio y migrar gradualmente, se agregó una organización por sistemas:

```txt
src/
  features/
    systems/
      coupon-visits/
      catalog-web/
      pos/
      model/systemsRegistry.js
      page/systemRoutes.js
      index.js
```

Esta capa funciona como **fachada**:

- Centraliza el registro de sistemas en `systemsRegistry`.
- Centraliza sus rutas en `systemRoutes`.
- Re-exporta APIs públicas sin acoplar `app/router` a los internals de cada sistema.


## Qué falta para poder eliminar legacy (`src/Components`)

> Meta: llegar a un estado donde `npm run dev` y el router principal ya no dependan de `src/Components/*` ni de `src/legacy/*`.

### Bloqueadores actuales

1. **Entry principal y providers del perfil nuevo ya desacoplados**
   - `src/main.jsx` usa `src/app` (`AppProviders` + `RouterProvider`) como entry principal.
   - `src/shared/providers/appContext` ahora es implementación propia y ya no depende de `src/legacy/providers/appContext`.

2. **Rutas con convivencia/duplicación en dominios grandes**
   - POS y cupones todavía conviven entre router legacy y router por features.
   - Debe existir un solo owner por ruta antes de borrar archivos heredados.

3. **Features aún consumen wrappers/adaptadores legacy**
   - Hay pantallas/flows que todavía dependen de `src/legacy/*` o de wrappers en `src/Components/*`.
   - Cada dependencia debe migrarse a `interface/service/model` nativos de la feature.

### Criterio de salida (Definition of Done para borrar legacy por dominio)

- [ ] El dominio ya no se importa desde `src/Components/*`.
- [ ] El dominio ya no se importa desde `src/legacy/*` (o el adaptador queda sin consumidores).
- [ ] Las rutas del dominio se registran solo desde `src/features/*` o `src/features/systems/*`.
- [ ] `npm run features:boundaries` en verde.
- [ ] `npm run build` en verde.
- [ ] Smoke test manual de navegación del dominio migrado.

### Orden recomendado para terminar la migración

1. **Cupones/visitas**: mantener `coupon-visits` solo como alias temporal y mover consumidores a `features/coupons`.
2. **Catálogo web**: reemplazar wrappers de página por implementación propia de feature.
3. **POS**: cerrar rutas duplicadas y terminar migración de subdominios (sales/reports/settings).
4. **Switch final de independencia**: retirar `src/legacy/*` de providers/rutas y, después, eliminar legacy por dominio.

## Reglas de migración incremental

1. No romper rutas legacy activas.
2. Migrar por dominio (feature) y por capas (model/service → hooks → interface → page).
3. Exponer cada feature únicamente por su `index.js` (API pública).
4. Evitar imports desde internals de otra feature.
5. Solo eliminar código legacy cuando no existan referencias activas.

## Flujo recomendado por PR

1. Elegir una pantalla o caso de uso concreto.
2. Extraer primero la lógica de dominio (`model`, `service`).
3. Mover hooks específicos de negocio (`hooks`).
4. Reubicar UI (`interface`) manteniendo markup/estilos.
5. Publicar entrada en `page` y conectar desde rutas existentes.
6. Validar `npm run lint` y `npm run build`.

## Ejecutar la versión nueva (arquitectura por features)

`npm run dev` ya usa el router de features (`src/app`). Puedes mantener `npm run new` como entry paralelo de validación durante la transición:

```bash
npm run new
```

Este comando abre `index.new.html` usando `src/new-main.jsx` y el router de `src/app`.



## Modo independiente (sin dependencia a legacy)

Para validar y ejecutar una versión del proyecto **100% desacoplada del legacy**:

```bash
npm run features:independence
npm run new:independent
```

- `features:independence`: falla si detecta imports hacia `src/legacy` dentro del perfil independiente (entry + router/provider independientes y features `landing`/`legal`).
- `new:independent`: levanta `index.independent.html` con `src/independent-main.jsx`, usando un router limitado a rutas independientes (`landing` + `legal`).

Este modo te permite migrar feature por feature sin arrastrar dependencias heredadas en el nuevo entry point.

## Auditorías para migración de POS

Para validar que el POS nuevo por features siga ordenado y conviviendo con el legacy sin romper rutas:

```bash
npm run pos:audit
npm run pos:coexistence-audit
```

- `pos:audit`: revisa carpetas mínimas por módulo y archivos `.js/.jsx` pendientes de migración en `src/features/pos`.
- `pos:coexistence-audit`: revisa convivencia entre `src/Components/CatalogoWeb/PuntoVenta` y `src/features/pos`, incluyendo rutas duplicadas.

## Crear una nueva feature

Se agregó un script para crear el esqueleto estándar:

```bash
npm run feature:new -- nombre-feature
# alias corto
npm run new -- nombre-feature
```

Esto crea automáticamente las carpetas `hooks`, `interface`, `model`, `page`, `service` y un `index.js` inicial en `src/features/nombre-feature`.

## Convenciones mínimas

- Preferir nombres de feature en `kebab-case`.
- Mantener componentes de `interface` sin llamadas directas a API.
- Centralizar efectos externos en `service`.
- Mantener `page` como orquestador de hooks + componentes de `interface`.

---

Para más detalle de la estrategia, revisar `src/features/README.md`.

Para un plan operativo paso a paso, revisar `docs/features-only-next-steps.md`.

## Hoja de ruta por dominios (migración gradual)

Para seguir mejorando sin romper producción, el plan recomendado queda así:

1. **Landing (`src/features/landing`)**
   - Consolidar UX responsive y desacoplar secciones por dominio visual.
   - ✅ Se ajustó el comportamiento mobile del formulario de contacto para evitar fricción al enviar.
2. **Cupones/Visitas (`src/features/coupon-visits`)**
   - Mantener rutas y flujos de backoffice/claim/redeem dentro de la feature.
   - Mover validaciones y reglas compartidas al `model/` de la feature cuando aún estén dispersas.
3. **Catálogo Web (`src/features/catalog-web`)**
   - Separar listado, detalle, categoría y pedido en páginas de la feature.
   - Normalizar adaptadores de petición/respuesta en `service/` para aislar cambios de API.
4. **POS (`src/features/pos`)**
   - Aislar marketing, auth y venta para avanzar hacia módulos internos más pequeños.
   - Dividir rutas por subdominio (onboarding, caja, reportes) cuando la migración avance.

### Regla práctica para el siguiente PR

Cuando migres un flujo nuevo, mueve primero la lógica a `service`/`model`, luego hooks, y al final UI.
Así evitas refactors grandes y reduces riesgo en producción.
