import { StorefrontCategory, StorefrontProductExtras, StorefrontProductsPage, StorefrontVariant } from "../api/CatalogStorefrontApi";
import { StorefrontBusiness, StorefrontProduct } from "../model/CatalogStorefrontModels";
import { CatalogOrderPayload } from "../model/CatalogStorefrontModels";

export interface ICatalogStorefrontRepository {
  registerBusinessVisit(businessId: string, mode?: "unique" | "always"): Promise<boolean>;
  getBusinessById(businessId: string): Promise<StorefrontBusiness | null>;
  getCategoriesByBusiness(businessId: string): Promise<StorefrontCategory[]>;
  getProductsByBusinessPage(businessId: string, page: number, planLimit?: string): Promise<StorefrontProductsPage>;
  getProductsByCategoryPage(categoryId: number, page: number, planLimit?: string): Promise<StorefrontProductsPage>;
  getAllProductsByBusiness(businessId: string, planLimit?: string): Promise<StorefrontProduct[]>;
  getAllProductsByCategory(categoryId: number, planLimit?: string): Promise<StorefrontProduct[]>;
  getProductById(productId: string): Promise<StorefrontProduct | null>;
  getVariantsByProductId(productId: number): Promise<StorefrontVariant[]>;
  getProductExtrasByProductId(productId: number): Promise<StorefrontProductExtras>;
  createCatalogOrder(payload: CatalogOrderPayload): Promise<{ Id?: number; Message?: string } | null>;
}
