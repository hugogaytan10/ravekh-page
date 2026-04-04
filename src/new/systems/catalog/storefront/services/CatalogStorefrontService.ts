import { ICatalogStorefrontRepository } from "../interface/ICatalogStorefrontRepository";

export class CatalogStorefrontService {
  constructor(private readonly repository: ICatalogStorefrontRepository) {}

  getBusiness(businessId: string) {
    return this.repository.getBusinessById(businessId);
  }

  getCategories(businessId: string) {
    return this.repository.getCategoriesByBusiness(businessId);
  }

  getProductsByBusiness(businessId: string, page: number, planLimit?: string) {
    return this.repository.getProductsByBusinessPage(businessId, page, planLimit);
  }

  getProductsByCategory(categoryId: number, page: number, planLimit?: string) {
    return this.repository.getProductsByCategoryPage(categoryId, page, planLimit);
  }

  getProduct(productId: string) {
    return this.repository.getProductById(productId);
  }

  getVariants(productId: number) {
    return this.repository.getVariantsByProductId(productId);
  }
}
