import type { Result } from "../../../../shared/model/Result";
import type { ICatalogProductRepository } from "../interfaces/ICatalogProductRepository";
import type { CatalogProduct } from "../model/CatalogProduct";

export class GetCatalogProductsService {
  constructor(private readonly repository: ICatalogProductRepository) {}

  public execute(businessId: number): Promise<Result<CatalogProduct[]>> {
    return this.repository.getProducts(businessId);
  }
}
