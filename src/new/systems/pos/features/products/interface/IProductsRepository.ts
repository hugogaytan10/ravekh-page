import { PaginatedMeta } from "../../../shared/model/Pagination";
import { ManagedProduct, ProductCategory, SaveManagedProductDto } from "../model/ManagedProduct";

export type ProductImportResult = { imported: number; message: string; errors: string[] };

export type ProductsPagination = PaginatedMeta & {
  categoryIds: number[];
};

export type ProductsPaginatedResult = {
  products: ManagedProduct[];
  pagination: ProductsPagination;
};

export interface IProductsRepository {
  listByBusiness(businessId: number, token: string): Promise<ManagedProduct[]>;
  listAllByBusiness(businessId: number, token: string, limit: string): Promise<ManagedProduct[]>;
  listReallyAllByBusiness(businessId: number, token: string): Promise<ManagedProduct[]>;
  listByBusinessPaginated(businessId: number, token: string, page: number, limit: string | number): Promise<ProductsPaginatedResult>;
  listByBusinessAllForSearch(businessId: number, token: string, limit: string | number): Promise<ManagedProduct[]>;
  getById(productId: number, token: string): Promise<ManagedProduct | null>;
  create(payload: SaveManagedProductDto, token: string): Promise<ManagedProduct>;
  update(payload: SaveManagedProductDto, token: string): Promise<ManagedProduct>;
  archive(productId: number, token: string): Promise<void>;

  listCategoriesByBusiness(businessId: number, token: string): Promise<ProductCategory[]>;
  createCategory(category: ProductCategory, token: string): Promise<ProductCategory>;
  updateCategory(category: ProductCategory, token: string): Promise<ProductCategory>;
  deleteCategory(categoryId: number, token: string): Promise<void>;
  importProducts(businessId: number, file: File, token: string): Promise<ProductImportResult>;
  importProductsZip(businessId: number, file: File, token: string): Promise<ProductImportResult>;
}
