import { FetchHttpClient } from "./core/api/FetchHttpClient";
import { CatalogApi } from "./systems/catalog/product-publishing/api/CatalogApi";
import { CatalogPublishingPage } from "./systems/catalog/product-publishing/pages/CatalogPublishingPage";
import { CatalogService } from "./systems/catalog/product-publishing/services/CatalogService";
import { LoyaltyApi } from "./systems/loyalty/rewards-management/api/LoyaltyApi";
import { RewardsManagementPage } from "./systems/loyalty/rewards-management/pages/RewardsManagementPage";
import { RewardService } from "./systems/loyalty/rewards-management/services/RewardService";
import { PosBusinessSettingsApi } from "./systems/pos/business-settings/api/PosBusinessSettingsApi";
import { BusinessSettingsPage } from "./systems/pos/business-settings/pages/BusinessSettingsPage";
import { BusinessSettingsService } from "./systems/pos/business-settings/services/BusinessSettingsService";
import { PosCashClosingApi } from "./systems/pos/cash-closing-management/api/PosCashClosingApi";
import { CashClosingPage } from "./systems/pos/cash-closing-management/pages/CashClosingPage";
import { CashClosingService } from "./systems/pos/cash-closing-management/services/CashClosingService";
import { PosDashboardApi } from "./systems/pos/dashboard-analytics/api/PosDashboardApi";
import { DashboardAnalyticsPage } from "./systems/pos/dashboard-analytics/pages/DashboardAnalyticsPage";
import { DashboardAnalyticsService } from "./systems/pos/dashboard-analytics/services/DashboardAnalyticsService";
import { PosExportReportApi } from "./systems/pos/export-reporting/api/PosExportReportApi";
import { ExportReportPage } from "./systems/pos/export-reporting/pages/ExportReportPage";
import { ExportReportService } from "./systems/pos/export-reporting/services/ExportReportService";
import { PosFinanceApi } from "./systems/pos/finance-tracking/api/PosFinanceApi";
import { FinanceTrackingPage } from "./systems/pos/finance-tracking/pages/FinanceTrackingPage";
import { FinanceTrackingService } from "./systems/pos/finance-tracking/services/FinanceTrackingService";
import { PosOnlineOrderApi } from "./systems/pos/online-order-tracking/api/PosOnlineOrderApi";
import { OnlineOrderTrackingPage } from "./systems/pos/online-order-tracking/pages/OnlineOrderTrackingPage";
import { OnlineOrderService } from "./systems/pos/online-order-tracking/services/OnlineOrderService";
import { PosOrderApi } from "./systems/pos/order-processing/api/PosOrderApi";
import { OrderProcessingPage } from "./systems/pos/order-processing/pages/OrderProcessingPage";
import { OrderService } from "./systems/pos/order-processing/services/OrderService";
import { PosReportingApi } from "./systems/pos/reporting-insights/api/PosReportingApi";
import { ReportingInsightsPage } from "./systems/pos/reporting-insights/pages/ReportingInsightsPage";
import { ReportingService } from "./systems/pos/reporting-insights/services/ReportingService";
import { PosProductApi } from "./systems/pos/sales-management/api/PosProductApi";
import { SalesManagementPage } from "./systems/pos/sales-management/pages/SalesManagementPage";
import { ProductService } from "./systems/pos/sales-management/services/ProductService";

export class ModernSystemsFactory {
  private readonly httpClient: FetchHttpClient;

  constructor(baseUrl: string) {
    this.httpClient = new FetchHttpClient(baseUrl);
  }

  createPosProductService(): ProductService {
    return new ProductService(new PosProductApi(this.httpClient));
  }

  createPosProductPage(): SalesManagementPage {
    return new SalesManagementPage(this.createPosProductService());
  }

  createPosOrderService(): OrderService {
    return new OrderService(new PosOrderApi(this.httpClient));
  }

  createPosOrderPage(): OrderProcessingPage {
    return new OrderProcessingPage(this.createPosOrderService());
  }

  createPosReportingService(): ReportingService {
    return new ReportingService(new PosReportingApi(this.httpClient));
  }

  createPosReportingPage(): ReportingInsightsPage {
    return new ReportingInsightsPage(this.createPosReportingService());
  }

  createPosBusinessSettingsService(): BusinessSettingsService {
    return new BusinessSettingsService(new PosBusinessSettingsApi(this.httpClient));
  }

  createPosBusinessSettingsPage(): BusinessSettingsPage {
    return new BusinessSettingsPage(this.createPosBusinessSettingsService());
  }

  createPosOnlineOrderService(): OnlineOrderService {
    return new OnlineOrderService(new PosOnlineOrderApi(this.httpClient));
  }

  createPosOnlineOrderPage(): OnlineOrderTrackingPage {
    return new OnlineOrderTrackingPage(this.createPosOnlineOrderService());
  }

  createPosExportReportService(): ExportReportService {
    return new ExportReportService(new PosExportReportApi(this.httpClient));
  }

  createPosExportReportPage(): ExportReportPage {
    return new ExportReportPage(this.createPosExportReportService());
  }

  createPosCashClosingService(): CashClosingService {
    return new CashClosingService(new PosCashClosingApi(this.httpClient));
  }

  createPosCashClosingPage(): CashClosingPage {
    return new CashClosingPage(this.createPosCashClosingService());
  }

  createPosDashboardAnalyticsService(): DashboardAnalyticsService {
    return new DashboardAnalyticsService(new PosDashboardApi(this.httpClient));
  }

  createPosDashboardAnalyticsPage(): DashboardAnalyticsPage {
    return new DashboardAnalyticsPage(this.createPosDashboardAnalyticsService());
  }

  createPosFinanceTrackingService(): FinanceTrackingService {
    return new FinanceTrackingService(new PosFinanceApi(this.httpClient));
  }

  createPosFinanceTrackingPage(): FinanceTrackingPage {
    return new FinanceTrackingPage(this.createPosFinanceTrackingService());
  }

  createCatalogService(): CatalogService {
    return new CatalogService(new CatalogApi(this.httpClient));
  }

  createCatalogPage(): CatalogPublishingPage {
    return new CatalogPublishingPage(this.createCatalogService());
  }

  createLoyaltyService(): RewardService {
    return new RewardService(new LoyaltyApi(this.httpClient));
  }

  createLoyaltyPage(): RewardsManagementPage {
    return new RewardsManagementPage(this.createLoyaltyService());
  }
}
