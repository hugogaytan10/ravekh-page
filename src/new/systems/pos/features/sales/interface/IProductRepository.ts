import { CreateProductDto, Product } from "../model/Product";

export interface ProductCategory {
  id: number;
  name: string;
}

export interface IProductRepository {
  listByBusiness(businessId: number, token: string): Promise<Product[]>;
  listCategoriesByBusiness(businessId: number, token: string): Promise<ProductCategory[]>;
  create(payload: CreateProductDto, token: string): Promise<Product>;
}
