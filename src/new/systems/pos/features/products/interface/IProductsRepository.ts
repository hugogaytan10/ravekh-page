import { PaginatedMeta } from "../../../shared/model/Pagination";
import { ManagedProduct, ProductCategory, SaveManagedProductDto } from "../model/ManagedProduct";

export type ProductsPagination = PaginatedMeta & {
  categoryIds: number[];
};

export type ProductsPaginatedResult = {
  products: ManagedProduct[];
  pagination: ProductsPagination;
};

export interface IProductsRepository {
  listByBusiness(businessId: number, token: string): Promise<ManagedProduct[]>;
  listByBusinessPaginated(businessId: number, token: string, page: number, limit: string | number): Promise<ProductsPaginatedResult>;
  getById(productId: number, token: string): Promise<ManagedProduct | null>;
  create(payload: SaveManagedProductDto, token: string): Promise<ManagedProduct>;
  update(payload: SaveManagedProductDto, token: string): Promise<ManagedProduct>;
  archive(productId: number, token: string): Promise<void>;

  listCategoriesByBusiness(businessId: number, token: string): Promise<ProductCategory[]>;
  createCategory(category: ProductCategory, token: string): Promise<ProductCategory>;
  updateCategory(category: ProductCategory, token: string): Promise<ProductCategory>;
  deleteCategory(categoryId: number, token: string): Promise<void>;
  importProducts(businessId: number, file: File, token: string): Promise<{ imported: number; message: string; errors?: string[] }>;
}
