import { CatalogProduct, PublishCatalogProductDto } from "../model/CatalogProduct";

export interface ICatalogRepository {
  listPublishedProducts(businessId: number, token: string): Promise<CatalogProduct[]>;
  publishProduct(payload: PublishCatalogProductDto, token: string): Promise<CatalogProduct>;
}
