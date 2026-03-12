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
<<<<<<< ours
- `src/features/landing`: feature completa para la landing page, orquestando todas las secciones desde su propio módulo.
- `src/features/coupon-visits`: feature inicial para el sistema de cupones/visitas.
- `src/features/catalog-web`: feature inicial para el sistema de catálogo web.
- `src/features/pos`: feature inicial para el sistema POS.
=======
- `src/features/landing`: feature completa para la landing page, incluyendo secciones de muestra y paquetes, con control de colores/estilos por sección.
- `src/features/coupon-visits`: feature para el sistema de cupones/visitas con rutas migradas al router paralelo.
- `src/features/catalog-web`: feature para catálogo web con rutas de listado, detalle, categoría y pedido.
- `src/features/pos`: feature para POS con rutas base de marketing, login, creación y venta.
>>>>>>> theirs

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
