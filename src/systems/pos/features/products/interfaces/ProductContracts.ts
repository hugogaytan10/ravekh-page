import type { Product } from "../models/Product";
import type { Result } from "../../../../shared/models/Result";

export interface ProductGateway {
  getByBusinessId(token: string, businessId: string): Promise<Product[]>;
  getById(token: string, productId: number): Promise<Product | null>;
  create(token: string, product: Product): Promise<Result<Product>>;
  update(token: string, product: Product): Promise<Result<Product>>;
  archive(token: string, productId: number): Promise<Result<null>>;
}

export interface ProductUseCases {
  listProducts(token: string, businessId: string): Promise<Result<Product[]>>;
  getProduct(token: string, productId: number): Promise<Result<Product | null>>;
  saveProduct(token: string, product: Product): Promise<Result<Product>>;
  archiveProduct(token: string, productId: number): Promise<Result<null>>;
}
