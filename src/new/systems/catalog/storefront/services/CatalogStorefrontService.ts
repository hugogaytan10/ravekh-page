import { ICatalogStorefrontRepository } from "../interface/ICatalogStorefrontRepository";

export class CatalogStorefrontService {
  constructor(private readonly repository: ICatalogStorefrontRepository) {}

  getBusiness(businessId: string) {
    return this.repository.getBusinessById(businessId);
  }

  getCategories(businessId: string) {
    return this.repository.getCategoriesByBusiness(businessId);
  }

  getProductsByBusiness(businessId: string, page: number, limit = 30) {
    return this.repository.getProductsByBusinessPage(businessId, page, limit);
  }

  getProductsByCategory(categoryId: number, page: number, limit = 30) {
    return this.repository.getProductsByCategoryPage(categoryId, page, limit);
  }

  getProduct(productId: string) {
    return this.repository.getProductById(productId);
  }

  getVariants(productId: number) {
    return this.repository.getVariantsByProductId(productId);
  }
}
