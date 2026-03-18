import { fail, ok, type Result } from "../../../../shared/models/Result";
import type { SalesGateway, SalesUseCases } from "../interfaces/SalesContracts";
import type { SalesBootstrapData, SalesProduct } from "../models/SalesModels";

export class PosSalesService implements SalesUseCases {
  constructor(private readonly salesGateway: SalesGateway) {}

  async loadBootstrap(token: string, businessId: string): Promise<Result<SalesBootstrapData>> {
    try {
      const [products, categories, business, taxes] = await Promise.all([
        this.salesGateway.getProducts(token, businessId),
        this.salesGateway.getCategories(token, businessId),
        this.salesGateway.getBusiness(token, businessId),
        this.salesGateway.getTaxes(token, businessId),
      ]);

      return ok(
        {
          products,
          categories,
          business,
          taxes,
        },
        "POS sales bootstrap loaded.",
      );
    } catch (error) {
      return fail("Failed to load POS sales bootstrap.", error instanceof Error ? error.message : "Unknown error");
    }
  }

  filterProductsByCategory(products: SalesProduct[], categoryId: number | null): SalesProduct[] {
    if (categoryId === null) {
      return products;
    }

    return products.filter((product) => product.categoryId === categoryId);
  }
}
