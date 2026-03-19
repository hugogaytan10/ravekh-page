# Feature-first architecture

This folder contains the modern migration strategy, split by **system** and **feature**.

## Systems

- `pos`
- `catalog`
- `loyalty`

## Feature contract

Every feature uses the same modules:

- `api`: infrastructure adapters for backend requests.
- `interface`: contracts for dependency inversion.
- `model`: domain entities and DTOs.
- `services`: use-cases and business rules.
- `pages`: orchestration layer for UI-facing view models.

## Current migration map

### POS

All POS modules are standardized under `src/new/systems/pos/features`.

- `sales`
- `products`
- `orders`
- `customers`
- `employees`
- `inventory`
- `finance`
- `dashboard`
- `reporting`
- `exports`
- `online-orders`
- `cash-closing`
- `auth`
- `settings/business`
- `settings/tax`
- `settings/table-zones`
- `settings/payment-methods`
- `settings/branding`

### Catalog

- `product-publishing`

### Loyalty

- `rewards-management`

## Rules for scalability

- Keep domain behavior in models and services.
- Keep transport mapping inside API adapters only.
- Prefer composition through interfaces to avoid coupling.
- Reuse existing contracts and endpoint patterns from legacy before adding new backend paths.
- Build small, composable features to keep code size low and optimize maintainability.
