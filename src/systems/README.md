# Feature-First Systems Architecture

This folder introduces a new modular architecture that can coexist with the legacy code until migration is complete.

## Systems

- `pos`: Point-of-sale domain.
- `catalog`: Public and internal catalog domain.
- `loyalty`: Loyalty and rewards domain.

## Standard feature layout

Each feature follows the same structure:

- `api`: Infrastructure adapters that talk to external services.
- `interfaces`: Contracts used by services and pages.
- `model`: Domain entities and DTO mappers.
- `services`: Application use cases with business rules.
- `pages`: UI entry points that consume services.

## Migration notes

1. Keep legacy modules in place to prevent runtime regressions.
2. Move one feature at a time, starting with POS sales.
3. Reuse DTO mappers to normalize legacy payloads.
4. Keep services independent from fetch/axios for testability.
