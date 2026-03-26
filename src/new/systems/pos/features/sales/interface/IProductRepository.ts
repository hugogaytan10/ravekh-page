import { PaginatedMeta } from "../../../shared/model/Pagination";
import { CreateProductDto, Product } from "../model/Product";

export interface ProductCategory {
  id: number;
  name: string;
}

export type SalesProductsPagination = PaginatedMeta & {
  categoryIds: number[];
};

export type SalesProductsPaginatedResult = {
  products: Product[];
  pagination: SalesProductsPagination;
};

export interface IProductRepository {
  listByBusiness(businessId: number, token: string): Promise<Product[]>;
  listAvailableByBusinessPaginated(
    businessId: number,
    token: string,
    limit: string,
    page: number,
  ): Promise<SalesProductsPaginatedResult>;
  listByCategoryPaginated(
    categoryId: number,
    token: string,
    limit: string,
    page: number,
  ): Promise<SalesProductsPaginatedResult>;
  listCategoriesByBusiness(businessId: number, token: string): Promise<ProductCategory[]>;
  create(payload: CreateProductDto, token: string): Promise<Product>;
}
