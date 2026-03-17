import { FetchHttpClient } from "./core/api/FetchHttpClient";
import { CatalogApi } from "./systems/catalog/product-publishing/api/CatalogApi";
import { CatalogService } from "./systems/catalog/product-publishing/services/CatalogService";
import { LoyaltyApi } from "./systems/loyalty/rewards-management/api/LoyaltyApi";
import { RewardService } from "./systems/loyalty/rewards-management/services/RewardService";
import { PosOrderApi } from "./systems/pos/order-processing/api/PosOrderApi";
import { OrderService } from "./systems/pos/order-processing/services/OrderService";
import { PosReportingApi } from "./systems/pos/reporting-insights/api/PosReportingApi";
import { ReportingService } from "./systems/pos/reporting-insights/services/ReportingService";
import { PosBusinessSettingsApi } from "./systems/pos/business-settings/api/PosBusinessSettingsApi";
import { PosCashClosingApi } from "./systems/pos/cash-closing-management/api/PosCashClosingApi";
import { CashClosingPage } from "./systems/pos/cash-closing-management/pages/CashClosingPage";
import { CashClosingService } from "./systems/pos/cash-closing-management/services/CashClosingService";
import { PosExportReportApi } from "./systems/pos/export-reporting/api/PosExportReportApi";
import { ExportReportPage } from "./systems/pos/export-reporting/pages/ExportReportPage";
import { ExportReportService } from "./systems/pos/export-reporting/services/ExportReportService";
import { BusinessSettingsPage } from "./systems/pos/business-settings/pages/BusinessSettingsPage";
import { BusinessSettingsService } from "./systems/pos/business-settings/services/BusinessSettingsService";
import { PosOnlineOrderApi } from "./systems/pos/online-order-tracking/api/PosOnlineOrderApi";
import { OnlineOrderTrackingPage } from "./systems/pos/online-order-tracking/pages/OnlineOrderTrackingPage";
import { OnlineOrderService } from "./systems/pos/online-order-tracking/services/OnlineOrderService";
import { PosProductApi } from "./systems/pos/sales-management/api/PosProductApi";
import { ProductService } from "./systems/pos/sales-management/services/ProductService";

export class ModernSystemsFactory {
  private readonly httpClient: FetchHttpClient;

  constructor(baseUrl: string) {
    this.httpClient = new FetchHttpClient(baseUrl);
  }

  createPosProductService(): ProductService {
    return new ProductService(new PosProductApi(this.httpClient));
  }

  createPosOrderService(): OrderService {
    return new OrderService(new PosOrderApi(this.httpClient));
  }

  createPosReportingService(): ReportingService {
    return new ReportingService(new PosReportingApi(this.httpClient));
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

  createCatalogService(): CatalogService {
    return new CatalogService(new CatalogApi(this.httpClient));
  }

  createLoyaltyService(): RewardService {
    return new RewardService(new LoyaltyApi(this.httpClient));
  }
}
