import { CatalogStorefrontService } from "../services/CatalogStorefrontService";

export class CatalogStorefrontExperiencePage {
  constructor(private readonly service: CatalogStorefrontService) {}

  registerVisit(businessId: string, mode: "unique" | "always" = "unique") {
    return this.service.registerBusinessVisit(businessId, mode);
  }

  async loadBusinessContext(businessId: string) {
    const [businessResult, categoriesResult] = await Promise.allSettled([
      this.service.getBusiness(businessId),
      this.service.getCategories(businessId),
    ]);

    const business = businessResult.status === "fulfilled" ? businessResult.value : null;
    const categories = categoriesResult.status === "fulfilled" ? categoriesResult.value : [];

    return [business, categories] as const;
  }

  loadProducts(businessId: string, page: number, categoryId?: number | null, planLimit?: string) {
    if (categoryId != null) {
      return this.service.getProductsByCategory(categoryId, page, planLimit);
    }

    return this.service.getProductsByBusiness(businessId, page, planLimit);
  }

  loadAllProducts(businessId: string, categoryId?: number | null, planLimit?: string) {
    if (categoryId != null) {
      return this.service.getAllProductsByCategory(categoryId, planLimit);
    }

    return this.service.getAllProductsByBusiness(businessId, planLimit);
  }

  loadProductDetail(productId: string) {
    return this.service.getProduct(productId);
  }

  loadVariants(productId: number) {
    return this.service.getVariants(productId);
  }

  loadExtras(productId: number) {
    return this.service.getExtras(productId);
  }
}
