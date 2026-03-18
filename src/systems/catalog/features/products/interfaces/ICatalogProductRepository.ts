import type { Result } from "../../../../shared/model/Result";
import type { CatalogProduct } from "../model/CatalogProduct";

export interface ICatalogProductRepository {
  getProducts(businessId: number): Promise<Result<CatalogProduct[]>>;
}
