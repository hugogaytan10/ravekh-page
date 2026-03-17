import type { CatalogProduct } from "../models/CatalogProduct";
import { CatalogProductApi } from "../api/CatalogProductApi";

export class CatalogProductService {
  constructor(private readonly api: CatalogProductApi) {}

  async getFeaturedProducts(): Promise<CatalogProduct[]> {
    return this.api.getFeaturedProducts();
  }
}
