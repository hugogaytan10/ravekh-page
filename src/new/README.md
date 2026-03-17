# Modern Feature-Based Architecture

This directory introduces a **new, decoupled architecture** that will coexist with the legacy code until migration is complete.

## Goals

- Keep legacy modules stable while creating modern replacements.
- Split code by **system** and then by **feature**.
- Keep each feature organized by the same layers:
  - `interface`
  - `model`
  - `services`
  - `api`
- Use class-based design to separate responsibilities.

## Systems included

- `pos`
- `catalog`
- `loyalty`

## Legacy analysis used for the initial design

- POS product requests from `src/Components/CatalogoWeb/PuntoVenta/Sales/Petitions.ts` were split into:
  - API adapter (`PosProductApi`)
  - Domain model (`Product`)
  - Business service (`ProductService`)
- Loyalty coupon requests from `src/Components/CatalogoWeb/Cupones/Petitions.ts` were split into:
  - API adapter (`LoyaltyApi`)
  - Domain model (`RewardCoupon`)
  - Business service (`RewardService`)

## Composition root

Use `src/new/index.ts` as the entry point for new modules through `ModernSystemsFactory`.

## Validation command

Run:

```bash
npm run new
```

It verifies that the new feature structure exists and is ready for incremental migration.
