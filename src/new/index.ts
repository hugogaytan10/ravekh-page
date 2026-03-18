import { FetchHttpClient } from "./core/api/FetchHttpClient";
import { CatalogApi } from "./systems/catalog/product-publishing/api/CatalogApi";
import { LoyaltyApi } from "./systems/loyalty/rewards-management/api/LoyaltyApi";
import { PosBusinessSettingsApi } from "./systems/pos/business-settings/api/PosBusinessSettingsApi";
import { PosCashClosingApi } from "./systems/pos/cash-closing-management/api/PosCashClosingApi";
import { PosCustomerApi } from "./systems/pos/customer-management/api/PosCustomerApi";
import { PosDashboardApi } from "./systems/pos/dashboard-analytics/api/PosDashboardApi";
import { PosEmployeeApi } from "./systems/pos/employee-management/api/PosEmployeeApi";
import { PosExportReportApi } from "./systems/pos/export-reporting/api/PosExportReportApi";
import { PosFinanceApi } from "./systems/pos/finance-tracking/api/PosFinanceApi";
import { PosInventoryApi } from "./systems/pos/inventory-management/api/PosInventoryApi";
import { PosOnlineOrderApi } from "./systems/pos/online-order-tracking/api/PosOnlineOrderApi";
import { PosOrderApi } from "./systems/pos/order-processing/api/PosOrderApi";
import { PosReportingApi } from "./systems/pos/reporting-insights/api/PosReportingApi";
import { PosProductApi } from "./systems/pos/sales-management/api/PosProductApi";
import {
  BusinessSettingsPage,
  BusinessSettingsService,
  CashClosingPage,
  CashClosingService,
  CustomerManagementPage,
  CustomerService,
  DashboardAnalyticsPage,
  DashboardAnalyticsService,
  EmployeeManagementPage,
  EmployeeService,
  ExportReportPage,
  ExportReportService,
  FinanceTrackingPage,
  FinanceTrackingService,
  InventoryManagementPage,
  InventoryService,
  OnlineOrderTrackingPage,
  OnlineOrderService,
  OrderProcessingPage,
  OrderService,
  ReportingInsightsPage,
  ReportingService,
  SalesManagementPage,
  ProductService,
} from "./systems/pos";
import { CatalogPublishingPage, CatalogService } from "./systems/catalog";
import { RewardsManagementPage, RewardService } from "./systems/loyalty";

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

  createPosCustomerService(): CustomerService {
    return new CustomerService(new PosCustomerApi(this.httpClient));
  }

  createPosCustomerPage(): CustomerManagementPage {
    return new CustomerManagementPage(this.createPosCustomerService());
  }

  createPosEmployeeService(): EmployeeService {
    return new EmployeeService(new PosEmployeeApi(this.httpClient));
  }

  createPosEmployeePage(): EmployeeManagementPage {
    return new EmployeeManagementPage(this.createPosEmployeeService());
  }

  createPosInventoryService(): InventoryService {
    return new InventoryService(new PosInventoryApi(this.httpClient));
  }

  createPosInventoryPage(): InventoryManagementPage {
    return new InventoryManagementPage(this.createPosInventoryService());
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
