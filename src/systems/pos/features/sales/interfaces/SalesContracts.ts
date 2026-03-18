import type { Result } from "../../../../shared/models/Result";
import type {
  BusinessProfile,
  BusinessTax,
  SalesBootstrapData,
  SalesCategory,
  SalesProduct,
} from "../models/SalesModels";

export interface SalesGateway {
  getProducts(token: string, businessId: string): Promise<SalesProduct[]>;
  getCategories(token: string, businessId: string): Promise<SalesCategory[]>;
  getBusiness(token: string, businessId: string): Promise<BusinessProfile | null>;
  getTaxes(token: string, businessId: string): Promise<BusinessTax[]>;
}

export interface SalesUseCases {
  loadBootstrap(token: string, businessId: string): Promise<Result<SalesBootstrapData>>;
  filterProductsByCategory(products: SalesProduct[], categoryId: number | null): SalesProduct[];
}
