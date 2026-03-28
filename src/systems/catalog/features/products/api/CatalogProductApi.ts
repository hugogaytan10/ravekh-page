import { HttpClient } from "../../../../shared/api/HttpClient";
import { failure, success, type Result } from "../../../../shared/model/Result";
import { getPosApiBaseUrl } from "../../../../shared/config/posEnv";
import type { ICatalogProductRepository } from "../interfaces/ICatalogProductRepository";
import {
  mapLegacyCatalogProduct,
  type CatalogProduct,
  type LegacyCatalogProductDto,
} from "../model/CatalogProduct";

const POS_API_BASE_URL = getPosApiBaseUrl();

export class CatalogProductApi implements ICatalogProductRepository {
  private readonly client: HttpClient;

  constructor(token: string) {
    this.client = new HttpClient({
      baseUrl: POS_API_BASE_URL,
      token,
    });
  }

  public async getProducts(businessId: number): Promise<Result<CatalogProduct[]>> {
    try {
      const rawProducts = await this.client.get<LegacyCatalogProductDto[]>(
        `products/stockgtzero/${businessId}`,
      );

      const products = rawProducts.map(mapLegacyCatalogProduct);
      return success(products);
    } catch (error) {
      return failure(
        error instanceof Error ? error.message : "Unable to load catalog products.",
      );
    }
  }
}
