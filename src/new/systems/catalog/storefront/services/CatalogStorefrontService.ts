import { ICatalogStorefrontRepository } from "../interface/ICatalogStorefrontRepository";

export class CatalogStorefrontService {
  constructor(private readonly repository: ICatalogStorefrontRepository) {}

  registerBusinessVisit(businessId: string) {
    return this.repository.registerBusinessVisit(businessId);
  }

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

  getAllProductsByBusiness(businessId: string, planLimit?: string) {
    return this.repository.getAllProductsByBusiness(businessId, planLimit);
  }

  getAllProductsByCategory(categoryId: number, planLimit?: string) {
    return this.repository.getAllProductsByCategory(categoryId, planLimit);
  }

  getProduct(productId: string) {
    return this.repository.getProductById(productId);
  }

  getVariants(productId: number) {
    return this.repository.getVariantsByProductId(productId);
  }

  getExtras(productId: number) {
    return this.repository.getProductExtrasByProductId(productId);
  }
}
