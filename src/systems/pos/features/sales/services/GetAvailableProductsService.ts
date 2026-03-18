import type { Result } from "../../../../shared/model/Result";
import type { IProductRepository } from "../interfaces/IProductRepository";
import type { Product } from "../model/Product";

export class GetAvailableProductsService {
  constructor(private readonly productRepository: IProductRepository) {}

  public execute(userId: number): Promise<Result<Product[]>> {
    return this.productRepository.getAvailableProducts(userId);
  }
}
