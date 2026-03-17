import { existsSync } from "node:fs";

const requiredPaths = [
  "src/new/core/api/HttpClient.ts",
  "src/new/core/api/FetchHttpClient.ts",
  "src/new/systems/pos/sales-management/api/PosProductApi.ts",
  "src/new/systems/pos/sales-management/interface/IProductRepository.ts",
  "src/new/systems/pos/sales-management/model/Product.ts",
  "src/new/systems/pos/sales-management/services/ProductService.ts",
  "src/new/systems/pos/order-processing/api/PosOrderApi.ts",
  "src/new/systems/pos/order-processing/interface/IOrderRepository.ts",
  "src/new/systems/pos/order-processing/model/Order.ts",
  "src/new/systems/pos/order-processing/services/OrderService.ts",
  "src/new/systems/pos/reporting-insights/api/PosReportingApi.ts",
  "src/new/systems/pos/reporting-insights/interface/IReportingRepository.ts",
  "src/new/systems/pos/reporting-insights/model/SalesReport.ts",
  "src/new/systems/pos/reporting-insights/services/ReportingService.ts",
  "src/new/systems/pos/business-settings/api/PosBusinessSettingsApi.ts",
  "src/new/systems/pos/business-settings/interface/IBusinessSettingsRepository.ts",
  "src/new/systems/pos/business-settings/model/BusinessSettings.ts",
  "src/new/systems/pos/business-settings/services/BusinessSettingsService.ts",
  "src/new/systems/pos/business-settings/pages/BusinessSettingsPage.ts",
  "src/new/systems/pos/online-order-tracking/api/PosOnlineOrderApi.ts",
  "src/new/systems/pos/online-order-tracking/interface/IOnlineOrderRepository.ts",
  "src/new/systems/pos/online-order-tracking/model/OnlineOrder.ts",
  "src/new/systems/pos/online-order-tracking/services/OnlineOrderService.ts",
  "src/new/systems/pos/online-order-tracking/pages/OnlineOrderTrackingPage.ts",
<<<<<<< ours
=======
  "src/new/systems/pos/export-reporting/api/PosExportReportApi.ts",
  "src/new/systems/pos/export-reporting/interface/IExportReportRepository.ts",
  "src/new/systems/pos/export-reporting/model/ExportReport.ts",
  "src/new/systems/pos/export-reporting/services/ExportReportService.ts",
  "src/new/systems/pos/export-reporting/pages/ExportReportPage.ts",
  "src/new/systems/pos/cash-closing-management/api/PosCashClosingApi.ts",
  "src/new/systems/pos/cash-closing-management/interface/ICashClosingRepository.ts",
  "src/new/systems/pos/cash-closing-management/model/CashClosing.ts",
  "src/new/systems/pos/cash-closing-management/services/CashClosingService.ts",
  "src/new/systems/pos/cash-closing-management/pages/CashClosingPage.ts",
>>>>>>> theirs
  "src/new/systems/catalog/product-publishing/api/CatalogApi.ts",
  "src/new/systems/catalog/product-publishing/interface/ICatalogRepository.ts",
  "src/new/systems/catalog/product-publishing/model/CatalogProduct.ts",
  "src/new/systems/catalog/product-publishing/services/CatalogService.ts",
  "src/new/systems/loyalty/rewards-management/api/LoyaltyApi.ts",
  "src/new/systems/loyalty/rewards-management/interface/IRewardRepository.ts",
  "src/new/systems/loyalty/rewards-management/model/RewardCoupon.ts",
  "src/new/systems/loyalty/rewards-management/services/RewardService.ts",
  "src/new/index.ts",
];

const missing = requiredPaths.filter((path) => !existsSync(path));

if (missing.length > 0) {
  console.error("Missing modern architecture files:");
  missing.forEach((path) => console.error(` - ${path}`));
  process.exit(1);
}

console.log("Modern feature-based architecture is ready.");
console.log("Systems: pos, catalog, loyalty.");
console.log("Layers per feature: interface, model, services, api, pages.");
<<<<<<< ours
console.log("POS features: sales-management, order-processing, reporting-insights, business-settings, online-order-tracking.");
=======
console.log("POS features: sales-management, order-processing, reporting-insights, business-settings, online-order-tracking, export-reporting, cash-closing-management.");
>>>>>>> theirs
