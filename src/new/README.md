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

Each feature in every system now includes all architecture layers: `api`, `interface`, `model`, `services`, and `pages`.

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
- `dashboard-analytics`
  - Focused on KPI comparisons, top-selling products/categories, and daily customer growth.
- `finance-tracking`
  - Focused on income/expense lifecycle, monthly overview, and transaction registration.
- `customer-management`
  - Focused on customer CRUD, search filtering, and pay-later policy visibility.
- `employee-management`
  - Focused on employee CRUD, role normalization, and access policy checks.
- `inventory-management`
  - Focused on inventory listing, low-stock detection, and stock updates.
- `auth-onboarding`
  - Focused on login and sign-up onboarding flows with validation and decoupled API mapping.
- `table-zone-management`
  - Focused on table-zone listing, table-zone upsert operations, and business-level table-order activation.
- `tax-management`
  - Focused on business tax loading, tax upsert lifecycle, and tax deactivation for sales settings.
- `payment-method-management`
  - Focused on global payment toggles and channel-level enablement with business rules for safe defaults.
- `branding-customization`
  - Focused on business branding profile (name, address, phone, logo, color, references) with strict save validation.

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
- POS tax settings requests from `src/Components/CatalogoWeb/PuntoVenta/Settings/Settings/SalesTaxSettings.tsx` and `src/Components/CatalogoWeb/PuntoVenta/Settings/Settings/Petitions.ts` were split into:
  - API adapter (`PosSalesTaxApi`)
  - Domain model (`SalesTax`)
  - Business service (`SalesTaxService`)
  - Presentation page model (`SalesTaxSettingsPage`)
- POS table-order requests from `src/Components/CatalogoWeb/PuntoVenta/Settings/Settings/Petitions.ts` and `src/Components/CatalogoWeb/PuntoVenta/Settings/Tables/TableOrders.tsx` were split into:
  - API adapter (`PosTableZoneApi`)
  - Domain model (`TableZone`)
  - Business service (`TableZoneService`)
  - Presentation page model (`TableZoneManagementPage`)
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
- POS dashboard requests from `src/Components/CatalogoWeb/PuntoVenta/Dashboard/Petitions.ts` were split into:
  - API adapter (`PosDashboardApi`)
  - Domain model (`DashboardSnapshot`, `ComparisonMetric`, `TopSellingItem`)
  - Business service (`DashboardAnalyticsService`)
  - Presentation page model (`DashboardAnalyticsPage`)
- POS finance requests from `src/Components/CatalogoWeb/PuntoVenta/Finance/Petitions.ts` were split into:
  - API adapter (`PosFinanceApi`)
  - Domain model (`FinanceOverview`, `FinanceEntry`)
  - Business service (`FinanceTrackingService`)
  - Presentation page model (`FinanceTrackingPage`)
- POS authentication requests from `src/Components/CatalogoWeb/PuntoVenta/Login/Peticiones.ts` were split into:
  - API adapter (`PosAuthOnboardingApi`)
  - Domain model (`AuthSession`)
  - Business service (`AuthOnboardingService`)
  - Presentation page model (`AuthOnboardingPage`)
- POS payment method screen behavior from `src/Components/CatalogoWeb/PuntoVenta/Settings/Settings/PaymentMethods.tsx` was split into:
  - API adapter (`PosPaymentMethodApi`)
  - Domain model (`PaymentMethodSettings`, `PaymentMethod`)
  - Business service (`PaymentMethodService`)
  - Presentation page model (`PaymentMethodManagementPage`)
- POS branding customization behavior from `src/Components/CatalogoWeb/PuntoVenta/Login/CustomizeApp.tsx` and `src/Components/CatalogoWeb/PuntoVenta/Settings/Settings/Petitions.ts` was split into:
  - API adapter (`PosBrandingApi`)
  - Domain model (`BrandingProfile`)
  - Business service (`BrandingService`)
  - Presentation page model (`BrandingCustomizationPage`)

## Composition root

Use `src/new/index.ts` as the entry point for new modules through `ModernSystemsFactory`.

Factory coverage now includes POS sales, order processing, reporting, business settings, table-zone management, online orders, export reports, cash closing, dashboard analytics, finance tracking, customer management, employee management, inventory management, and auth onboarding.
Factory coverage now includes POS sales, order processing, reporting, business settings, table-zone management, tax management, payment method management, online orders, export reports, cash closing, dashboard analytics, finance tracking, customer management, employee management, inventory management, and auth onboarding.
Factory coverage now includes POS sales, order processing, reporting, business settings, table-zone management, tax management, payment method management, branding customization, online orders, export reports, cash closing, dashboard analytics, finance tracking, customer management, employee management, inventory management, and auth onboarding.

## Validation command

Run:

```bash
npm run new
```

It verifies that the base feature structure exists and is ready for incremental migration.
