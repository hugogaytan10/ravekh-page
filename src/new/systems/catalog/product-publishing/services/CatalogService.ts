import { ICatalogRepository } from "../interface/ICatalogRepository";
import { CatalogProduct, PublishCatalogProductDto } from "../model/CatalogProduct";

export class CatalogService {
  constructor(private readonly repository: ICatalogRepository) {}

  async getPublishedProducts(businessId: number, token: string): Promise<CatalogProduct[]> {
    return this.repository.listPublishedProducts(businessId, token);
  }

  async publishProduct(payload: PublishCatalogProductDto, token: string): Promise<CatalogProduct> {
    return this.repository.publishProduct(payload, token);
  }
}
