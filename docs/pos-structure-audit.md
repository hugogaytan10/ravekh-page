# Auditoría de estructura POS

> Reporte generado automáticamente con `node scripts/audit-pos-structure.mjs`.

## Reglas evaluadas

- Cada módulo de `src/features/pos/*` debería incluir: `hooks`, `interface`, `model`, `page`, `service`, `types`.
- Se listan archivos `.js/.jsx` para identificar pendientes de migración hacia `.ts/.tsx`.

## Carpetas faltantes por módulo

| Módulo | Carpetas faltantes |
| --- | --- |
| customers | — |
| dashboard | — |
| employees | — |
| finance | — |
| products | — |
| reports | — |
| sales | — |
| settings | — |

## Archivos JS/JSX detectados en POS

- src/features/pos/customers/index.js
- src/features/pos/dashboard/index.js
- src/features/pos/dashboard/page/PosDashboardPage.jsx
- src/features/pos/employees/index.js
- src/features/pos/finance/index.js
- src/features/pos/finance/model/posFinanceRoutes.js
- src/features/pos/finance/page/PosFinanceFeatureRoutes.jsx
- src/features/pos/finance/page/PosFinancePages.jsx
- src/features/pos/finance/service/buildPosFinanceFeatureRoutes.js
- src/features/pos/finance/service/getPosFinanceRoute.js
- src/features/pos/hooks/usePosMarketingNavigation.js
- src/features/pos/index.js
- src/features/pos/interface/PosCreateStoreView.jsx
- src/features/pos/interface/PosMarketingView.jsx
- src/features/pos/interface/marketing/PosMarketingNavbar.jsx
- src/features/pos/model/posMarketingNavigation.js
- src/features/pos/model/posRoutes.js
- src/features/pos/page/PosAuthPage.jsx
- src/features/pos/page/PosCreateStorePage.jsx
- src/features/pos/page/PosFeatureRoutes.jsx
- src/features/pos/page/PosMarketingPage.jsx
- src/features/pos/products/index.js
- src/features/pos/reports/index.js
- src/features/pos/sales/hooks/usePosSalesFeatureRoutes.js
- src/features/pos/sales/index.js
- src/features/pos/sales/interface/PosCartView.jsx
- src/features/pos/sales/interface/PosDiscountScreenView.jsx
- src/features/pos/sales/interface/PosFinishScreenView.jsx
- src/features/pos/sales/interface/PosPaymentScreenView.jsx
- src/features/pos/sales/interface/PosPaymentTypeScreenView.jsx
- src/features/pos/sales/interface/PosQuantityNextSellView.jsx
- src/features/pos/sales/interface/PosSalesView.jsx
- src/features/pos/sales/model/posSalesRoutes.js
- src/features/pos/sales/page/PosCartPage.jsx
- src/features/pos/sales/page/PosDiscountScreenPage.jsx
- src/features/pos/sales/page/PosFinishScreenPage.jsx
- src/features/pos/sales/page/PosPaymentScreenPage.jsx
- src/features/pos/sales/page/PosPaymentTypeScreenPage.jsx
- src/features/pos/sales/page/PosQuantityNextSellPage.jsx
- src/features/pos/sales/page/PosSalesFeatureRoutes.jsx
- src/features/pos/sales/page/PosSalesPage.jsx
- src/features/pos/sales/products/index.js
- src/features/pos/sales/products/interface/PosAddCategoriesSalesView.jsx
- src/features/pos/sales/products/interface/PosAddProductSalesView.jsx
- src/features/pos/sales/products/interface/PosCategoriasScreenSalesView.jsx
- src/features/pos/sales/products/interface/PosScannerSalesView.jsx
- src/features/pos/sales/products/interface/PosSearchScreenSalesView.jsx
- src/features/pos/sales/products/page/PosAddCategoriesSalesPage.jsx
- src/features/pos/sales/products/page/PosAddProductSalesPage.jsx
- src/features/pos/sales/products/page/PosCategoriasScreenSalesPage.jsx
- src/features/pos/sales/products/page/PosScannerSalesPage.jsx
- src/features/pos/sales/products/page/PosSearchScreenSalesPage.jsx
- src/features/pos/sales/service/buildPosSalesFeatureRoutes.js
- src/features/pos/sales/service/getPosSalesRoute.js
- src/features/pos/service/buildPosFeatureRoutes.js
- src/features/pos/service/getPosRoute.js
- src/features/pos/settings/index.js

