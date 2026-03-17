import { IProductRepository } from "../interface/IProductRepository";
import { CreateProductDto, Product } from "../model/Product";

export class ProductService {
  constructor(private readonly repository: IProductRepository) {}

  async getSellableProducts(businessId: number, token: string): Promise<Product[]> {
    const products = await this.repository.listByBusiness(businessId, token);
    return products.filter((product) => product.hasStock());
  }

  async createProduct(payload: CreateProductDto, token: string): Promise<Product> {
    return this.repository.create(payload, token);
  }
}
