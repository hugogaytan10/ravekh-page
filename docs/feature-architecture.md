# Migración gradual a arquitectura por features

Este proyecto ya incluye una primera migración en paralelo hacia `src/features` sin romper el flujo actual.

## Objetivo

Mantener el código legado funcionando mientras se migra módulo por módulo a una estructura consistente por feature.

## Estructura propuesta

```txt
src/
  features/
    <feature-name>/
      model/      # Tipos, modelos de dominio y estructuras de datos
      service/    # Lógica de acceso a API / orquestación de datos
      hooks/      # Hooks específicos de la feature
      interface/  # Componentes presentacionales y adaptadores de UI
      page/       # Pantallas y composición final
```

## Estrategia de migración (sin romper producción)

1. **Crear feature nueva en paralelo** en `src/features/<feature>`.
2. **Reutilizar rutas/componentes actuales como wrappers** para apuntar internamente a la nueva feature.
3. **Mover primero datos y lógica**, luego UI.
4. **Evitar big bang**: migrar una feature a la vez.
5. **Cuando termine una feature**, actualizar imports de consumo directo y eliminar wrappers sólo cuando no haya referencias.

## Convenciones recomendadas

- Evitar dependencias entre features; compartir por `src/shared` cuando aplique.
- Mantener los nombres estables y explícitos: `XxxPage`, `useXxx`, `getXxx`.
- El `model` no debe conocer detalles de UI.
- El `interface` no debe conocer detalles de infraestructura (fetch/axios).

## Estado actual

- Se migró la feature **legal/privacy-policy** a `src/features/legal`.
- Los componentes legacy de `src/Components/PoliticaPrivacidad` ahora son wrappers, por lo que no se rompieron rutas existentes.
