# Ravekh Page

Aplicación web en React + Vite que actualmente convive entre una base **legacy** (`src/Components`) y una base moderna por **features** (`src/features`).

## Objetivo de arquitectura

Mantener el comportamiento actual en producción mientras se migra de forma incremental a una arquitectura basada en features, sin “big bang refactor”.

## Estado actual

- `src/Components`: código legacy que sigue siendo fuente principal de rutas/pantallas.
- `src/features`: nuevo espacio para módulos aislados por dominio.
- `src/features/legal`: ejemplo real de feature ya migrada parcialmente.
- `src/features/landing`: nueva feature para la landing principal, conectada con wrapper legacy en `src/Components/LandingPage`.

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

## Crear una nueva feature

Se agregó un script para crear el esqueleto estándar:

```bash
npm run feature:new -- nombre-feature
```

Esto crea automáticamente las carpetas `hooks`, `interface`, `model`, `page`, `service` y un `index.js` inicial en `src/features/nombre-feature`.

## Convenciones mínimas

- Preferir nombres de feature en `kebab-case`.
- Mantener componentes de `interface` sin llamadas directas a API.
- Centralizar efectos externos en `service`.
- Mantener `page` como orquestador de hooks + componentes de `interface`.

---

Para más detalle de la estrategia, revisar `src/features/README.md`.
