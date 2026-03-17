import { FetchHttpClient } from "./core/api/FetchHttpClient";
import { CatalogApi } from "./systems/catalog/product-publishing/api/CatalogApi";
import { CatalogService } from "./systems/catalog/product-publishing/services/CatalogService";
import { LoyaltyApi } from "./systems/loyalty/rewards-management/api/LoyaltyApi";
import { RewardService } from "./systems/loyalty/rewards-management/services/RewardService";
import { PosOrderApi } from "./systems/pos/order-processing/api/PosOrderApi";
import { OrderService } from "./systems/pos/order-processing/services/OrderService";
import { PosReportingApi } from "./systems/pos/reporting-insights/api/PosReportingApi";
import { ReportingService } from "./systems/pos/reporting-insights/services/ReportingService";
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

  createCatalogService(): CatalogService {
    return new CatalogService(new CatalogApi(this.httpClient));
  }

  createLoyaltyService(): RewardService {
    return new RewardService(new LoyaltyApi(this.httpClient));
  }
}
