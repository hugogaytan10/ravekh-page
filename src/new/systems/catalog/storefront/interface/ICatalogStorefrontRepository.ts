import { StorefrontCategory, StorefrontProductsPage, StorefrontVariant } from "../api/CatalogStorefrontApi";
import { StorefrontBusiness, StorefrontProduct } from "../model/CatalogStorefrontModels";

export interface ICatalogStorefrontRepository {
  getBusinessById(businessId: string): Promise<StorefrontBusiness | null>;
  getCategoriesByBusiness(businessId: string): Promise<StorefrontCategory[]>;
  getProductsByBusinessPage(businessId: string, page: number, limit?: number): Promise<StorefrontProductsPage>;
  getProductsByCategoryPage(categoryId: number, page: number, limit?: number): Promise<StorefrontProductsPage>;
  getProductById(productId: string): Promise<StorefrontProduct | null>;
  getVariantsByProductId(productId: number): Promise<StorefrontVariant[]>;
}
