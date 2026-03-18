# Modern Systems Architecture

This folder contains the new feature-based architecture used to migrate from the legacy implementation.

## Systems

- `pos`: Point of sale system.
- `catalog`: Catalog and ecommerce system.
- `loyalty`: Loyalty and rewards system.

## Feature layout

Every feature follows the same structure:

- `interfaces`: Contracts and ports.
- `models`: Domain models.
- `api`: Infrastructure adapters and mappers.
- `services`: Business use cases.
- `pages`: UI entry points.

## POS migration status

- `products`: modernized.
- `sales`: modernized bootstrap and category filtering.

This design keeps responsibilities decoupled and allows incremental migration while legacy code remains active.
