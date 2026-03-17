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

## POS features currently migrated

- `sales-management`
  - Focused on product retrieval and product creation for POS sales flows.
- `order-processing`
  - Focused on order registration and tax retrieval for checkout scenarios.
- `reporting-insights`
  - Focused on sales summaries and income series by period.

## Legacy analysis used for the design

- POS product requests from `src/Components/CatalogoWeb/PuntoVenta/Sales/Petitions.ts` were split into:
  - API adapter (`PosProductApi`)
  - Domain model (`Product`)
  - Business service (`ProductService`)
- POS cart and checkout requests from `src/Components/CatalogoWeb/PuntoVenta/Sales/Cart/Petitions.ts` were split into:
  - API adapter (`PosOrderApi`)
  - Domain model (`Order`, `OrderLine`, `TaxRule`)
  - Business service (`OrderService`)
- POS reports requests from `src/Components/CatalogoWeb/PuntoVenta/Reports/Petitions.ts` were split into:
  - API adapter (`PosReportingApi`)
  - Domain model (`SalesReport`, `SalesSummary`, `IncomePoint`)
  - Business service (`ReportingService`)
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

It verifies that the base feature structure exists and is ready for incremental migration.
