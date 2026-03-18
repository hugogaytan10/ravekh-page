import type { Result } from "../../../../shared/model/Result";
import type { Product } from "../model/Product";

export interface IProductRepository {
  getAvailableProducts(userId: number): Promise<Result<Product[]>>;
}
