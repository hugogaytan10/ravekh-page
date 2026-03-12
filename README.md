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
- `src/features/coupon-visits`: feature para el sistema de cupones/visitas con rutas migradas al router paralelo.
- `src/features/catalog-web`: feature para catálogo web con rutas de listado, detalle, categoría y pedido.
- `src/features/pos`: feature para POS con rutas base de marketing, login, creación y venta.

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

Además del entry legacy (`npm run dev`), puedes levantar el entry experimental basado en features:

```bash
npm run new
```

Este comando abre `index.new.html` usando `src/new-main.jsx` y el router de `src/app`.

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

## Hoja de ruta por dominios (migración gradual)

Para seguir mejorando sin romper producción, el plan recomendado queda así:

1. **Landing (`src/features/landing`)**
   - Consolidar UX responsive y desacoplar secciones por dominio visual.
   - ✅ Se ajustó el comportamiento mobile del formulario de contacto para evitar fricción al enviar.
2. **Cupones/Visitas (`src/features/coupon-visits`)**
   - Mantener rutas y flujos de backoffice/claim/redeem dentro de la feature.
3. **Catálogo Web (`src/features/catalog-web`)**
   - Separar listado, detalle, categoría y pedido en páginas de la feature.
4. **POS (`src/features/pos`)**
   - Aislar marketing, auth y venta para avanzar hacia módulos internos más pequeños.

### Regla práctica para el siguiente PR

Cuando migres un flujo nuevo, mueve primero la lógica a `service`/`model`, luego hooks, y al final UI.
Así evitas refactors grandes y reduces riesgo en producción.
