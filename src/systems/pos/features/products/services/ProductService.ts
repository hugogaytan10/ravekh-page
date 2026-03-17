import { fail, ok, type Result } from "../../../../shared/models/Result";
import type { ProductGateway, ProductUseCases } from "../interfaces/ProductContracts";
import type { Product } from "../models/Product";

export class ProductService implements ProductUseCases {
  constructor(private readonly productGateway: ProductGateway) {}

  async listProducts(token: string, businessId: string): Promise<Result<Product[]>> {
    try {
      const products = await this.productGateway.getByBusinessId(token, businessId);
      return ok(products, "Products loaded.");
    } catch (error) {
      return fail("Failed to load products.", error instanceof Error ? error.message : "Unknown error");
    }
  }

  async getProduct(token: string, productId: number): Promise<Result<Product | null>> {
    try {
      const product = await this.productGateway.getById(token, productId);
      return ok(product, "Product loaded.");
    } catch (error) {
      return fail("Failed to load product.", error instanceof Error ? error.message : "Unknown error");
    }
  }

  async saveProduct(token: string, product: Product): Promise<Result<Product>> {
    return product.id
      ? this.productGateway.update(token, product)
      : this.productGateway.create(token, product);
  }

  async archiveProduct(token: string, productId: number): Promise<Result<null>> {
    return this.productGateway.archive(token, productId);
  }
}
