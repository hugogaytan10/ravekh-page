# Arquitectura basada en features

Este directorio permite migrar el proyecto **de forma gradual** sin romper el flujo actual en `src/Components`.

## Objetivo

Mantener el código actual funcionando mientras cada dominio nuevo (o refactor) vive dentro de `src/features/<feature-name>` con una estructura consistente.

## Estructura recomendada por feature

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

### Responsabilidades

- `page/`: contenedores de pantalla/ruta.
- `interface/`: componentes de UI de la feature (presentacionales).
- `service/`: llamadas API, adaptadores, utilidades de dominio.
- `model/`: modelos, mocks, esquemas o constantes de dominio.
- `hooks/`: hooks específicos de la feature.
- `index.js`: API pública de la feature (exportaciones controladas).

## Estrategia de migración incremental

1. **Congelar rutas legacy**: no mover todo de golpe.
2. **Crear una feature nueva** para cada módulo nuevo o refactor.
3. **Usar wrappers de compatibilidad** en `src/Components` cuando sea necesario.
4. **Migrar por capas** en este orden:
   - `model` y `service`
   - `hooks`
   - `interface`
   - `page`
5. **Actualizar imports** para depender de `features/<feature>/index.js` y no de rutas internas.
6. **Eliminar código legacy** solo cuando no existan referencias activas.

## Criterios de calidad

- Evitar imports cruzados entre features (usar `shared/` para utilidades comunes).
- Mantener componentes de `interface/` sin lógica de negocio compleja.
- Mantener `service/` sin dependencias de UI.
- En cada migración, conservar comportamiento y estilos actuales primero; optimizar después.

## Checklist para cada migración

- [ ] Existe `index.js` como API pública.
- [ ] La feature compila sin dependencias cíclicas.
- [ ] La ruta legacy sigue funcionando (si aplica).
- [ ] Se validó build/lint.
- [ ] Se documentó el alcance en el PR.
