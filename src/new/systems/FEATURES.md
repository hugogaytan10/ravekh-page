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

Legacy code remains active while feature modules are rebuilt incrementally in TypeScript.

### POS

- `sales-management`
- `customer-management`
- `employee-management`
- `inventory-management`
- `auth-onboarding`
- `business-settings`
- `online-order-tracking`
- `export-reporting`
- `cash-closing-management`
- `dashboard-analytics`
- `finance-tracking`
- `auth-onboarding` is focused on login and business registration flows decoupled from UI state management.
- existing POS features will continue migrating with the same contract.

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
