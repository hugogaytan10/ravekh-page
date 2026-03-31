import { CatalogStorefrontService } from "../services/CatalogStorefrontService";

export class CatalogStorefrontExperiencePage {
  constructor(private readonly service: CatalogStorefrontService) {}

  loadBusinessContext(businessId: string) {
    return Promise.all([this.service.getBusiness(businessId), this.service.getCategories(businessId)]);
  }

  loadProducts(businessId: string, page: number, categoryId?: number | null) {
    if (categoryId != null) {
      return this.service.getProductsByCategory(categoryId, page);
    }

    return this.service.getProductsByBusiness(businessId, page);
  }

  loadProductDetail(productId: string) {
    return this.service.getProduct(productId);
  }

  loadVariants(productId: number) {
    return this.service.getVariants(productId);
  }
}
