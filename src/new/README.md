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
  - `pages`
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
- `business-settings`
  - Focused on business configuration, tax updates, and table activation settings.
- `online-order-tracking`
  - Focused on online order listing, details, and status updates.
- `export-reporting`
  - Focused on optimized report export by scope and period through reusable queries.
- `cash-closing-management`
  - Focused on employee cash-closing lifecycle, current closing checks, and history.

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
- POS business settings requests from `src/Components/CatalogoWeb/PuntoVenta/Settings/Settings/Petitions.ts` were split into:
  - API adapter (`PosBusinessSettingsApi`)
  - Domain model (`BusinessSettings`)
  - Business service (`BusinessSettingsService`)
  - Presentation page model (`BusinessSettingsPage`)
- POS online order requests from `src/Components/CatalogoWeb/PuntoVenta/Settings/StoreOnline/Petitions.ts` were split into:
  - API adapter (`PosOnlineOrderApi`)
  - Domain model (`OnlineOrder`)
  - Business service (`OnlineOrderService`)
  - Presentation page model (`OnlineOrderTrackingPage`)
- POS export reports requests from `src/Components/CatalogoWeb/PuntoVenta/Settings/ExportReports/Petitions.ts` were split into:
  - API adapter (`PosExportReportApi`)
  - Domain model (`ExportReport`, `ExportReportItem`)
  - Business service (`ExportReportService`)
  - Presentation page model (`ExportReportPage`)
- POS cash-closing requests from `src/Components/CatalogoWeb/PuntoVenta/Settings/BoxCutting/Petitions.ts` were split into:
  - API adapter (`PosCashClosingApi`)
  - Domain model (`CashClosing`)
  - Business service (`CashClosingService`)
  - Presentation page model (`CashClosingPage`)

## Composition root

Use `src/new/index.ts` as the entry point for new modules through `ModernSystemsFactory`.

## Validation command

Run:

```bash
npm run new
```

It verifies that the base feature structure exists and is ready for incremental migration.
