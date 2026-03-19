import { FetchHttpClient } from "./core/api/FetchHttpClient";
import { CatalogApi } from "./systems/catalog/product-publishing/api/CatalogApi";
import { LoyaltyApi } from "./systems/loyalty/rewards-management/api/LoyaltyApi";
import { PosBusinessSettingsApi } from "./systems/pos/features/settings/business/api/PosBusinessSettingsApi";
import { PosCashClosingApi } from "./systems/pos/features/cash-closing/api/PosCashClosingApi";
import { PosCustomerApi } from "./systems/pos/features/customers/api/PosCustomerApi";
import { PosDashboardApi } from "./systems/pos/features/dashboard/api/PosDashboardApi";
import { PosEmployeeApi } from "./systems/pos/features/employees/api/PosEmployeeApi";
import { PosExportReportApi } from "./systems/pos/features/exports/api/PosExportReportApi";
import { PosFinanceApi } from "./systems/pos/features/finance/api/PosFinanceApi";
import { PosInventoryApi } from "./systems/pos/features/inventory/api/PosInventoryApi";
import { PosOnlineOrderApi } from "./systems/pos/features/online-orders/api/PosOnlineOrderApi";
import { PosOrderApi } from "./systems/pos/features/orders/api/PosOrderApi";
import { PosReportingApi } from "./systems/pos/features/reporting/api/PosReportingApi";
import { PosProductApi } from "./systems/pos/features/sales/api/PosProductApi";
import { PosProductsApi } from "./systems/pos/features/products/api/PosProductsApi";
import { PosAuthOnboardingApi } from "./systems/pos/features/auth/api/PosAuthOnboardingApi";
import { PosTableZoneApi } from "./systems/pos/features/settings/table-zones/api/PosTableZoneApi";
import { PosSalesTaxApi } from "./systems/pos/features/settings/tax/api/PosSalesTaxApi";
import { PosPaymentMethodApi } from "./systems/pos/features/settings/payment-methods/api/PosPaymentMethodApi";
import { PosBrandingApi } from "./systems/pos/features/settings/branding/api/PosBrandingApi";
import { PosHealthApi } from "./systems/pos/features/health/api/PosHealthApi";
import {
  AuthOnboardingPage,
  AuthOnboardingService,
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
  ProductsManagementPage,
  ProductsService,
  TableZoneManagementPage,
  TableZoneService,
  SalesTaxService,
  SalesTaxSettingsPage,
  PaymentMethodManagementPage,
  PaymentMethodService,
  BrandingCustomizationPage,
  BrandingService,
  HealthPage,
  HealthService,
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

  createPosProductsService(): ProductsService {
    return new ProductsService(new PosProductsApi(this.httpClient));
  }

  createPosProductsPage(): ProductsManagementPage {
    return new ProductsManagementPage(this.createPosProductsService());
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

  createPosAuthOnboardingService(): AuthOnboardingService {
    return new AuthOnboardingService(new PosAuthOnboardingApi(this.httpClient));
  }

  createPosAuthOnboardingPage(): AuthOnboardingPage {
    return new AuthOnboardingPage(this.createPosAuthOnboardingService());
  }

  createPosTableZoneService(): TableZoneService {
    return new TableZoneService(new PosTableZoneApi(this.httpClient));
  }

  createPosTableZonePage(): TableZoneManagementPage {
    return new TableZoneManagementPage(this.createPosTableZoneService());
  }

  createPosSalesTaxService(): SalesTaxService {
    return new SalesTaxService(new PosSalesTaxApi(this.httpClient));
  }

  createPosSalesTaxPage(): SalesTaxSettingsPage {
    return new SalesTaxSettingsPage(this.createPosSalesTaxService());
  }

  createPosPaymentMethodService(): PaymentMethodService {
    return new PaymentMethodService(new PosPaymentMethodApi(this.httpClient));
  }

  createPosPaymentMethodPage(): PaymentMethodManagementPage {
    return new PaymentMethodManagementPage(this.createPosPaymentMethodService());
  }

  createPosBrandingService(): BrandingService {
    return new BrandingService(new PosBrandingApi(this.httpClient));
  }

  createPosBrandingPage(): BrandingCustomizationPage {
    return new BrandingCustomizationPage(this.createPosBrandingService());
  }

  createPosHealthService(): HealthService {
    return new HealthService(new PosHealthApi(this.httpClient));
  }

  createPosHealthPage(): HealthPage {
    return new HealthPage(this.createPosHealthService());
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
