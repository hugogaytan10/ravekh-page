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

## Current POS migration track

Legacy code remains in production while feature modules are rebuilt incrementally in TypeScript.

- `sales-management`
- `customer-management`
- `employee-management`
- other POS features will follow the same contract.

## Rules for scalability

- Keep domain behavior in models and services.
- Keep transport mapping inside API adapters only.
- Prefer composition through interfaces to avoid coupling.
- Reuse existing contracts and endpoint patterns from legacy before adding new backend paths.
