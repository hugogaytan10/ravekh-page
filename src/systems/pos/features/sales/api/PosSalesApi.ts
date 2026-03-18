import { HttpClient } from "../../../../shared/api/HttpClient";
import { failure, success, type Result } from "../../../../shared/model/Result";
import type { IProductRepository } from "../interfaces/IProductRepository";
import {
  mapLegacyProductDto,
  type LegacyProductDto,
  type Product,
} from "../model/Product";

const POS_API_BASE_URL = "https://apipos.ravekh.com/api/";

export class PosSalesApi implements IProductRepository {
  private readonly client: HttpClient;

  constructor(token: string) {
    this.client = new HttpClient({
      baseUrl: POS_API_BASE_URL,
      token,
    });
  }

  public async getAvailableProducts(userId: number): Promise<Result<Product[]>> {
    try {
      const [nullStock, stockGtZero] = await Promise.all([
        this.client.get<LegacyProductDto[]>(`products/stocknull/${userId}`),
        this.client.get<LegacyProductDto[]>(`products/stockgtzero/${userId}`),
      ]);

      const deduped = [...nullStock, ...stockGtZero].reduce<Map<number, Product>>(
        (accumulator, rawProduct) => {
          const product = mapLegacyProductDto(rawProduct);
          accumulator.set(product.id, product);
          return accumulator;
        },
        new Map<number, Product>(),
      );

      return success([...deduped.values()]);
    } catch (error) {
      return failure(
        error instanceof Error
          ? error.message
          : "Unable to load products from POS API.",
      );
    }
  }
}
