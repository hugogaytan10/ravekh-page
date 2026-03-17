import { CreateProductDto, Product } from "../model/Product";

export interface IProductRepository {
  listByBusiness(businessId: number, token: string): Promise<Product[]>;
  create(payload: CreateProductDto, token: string): Promise<Product>;
}
