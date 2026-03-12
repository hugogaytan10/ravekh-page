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
```

Esto evita inconsistencias de estructura y acelera migraciones pequeñas por dominio.
