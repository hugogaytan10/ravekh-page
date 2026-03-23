import { ManagedProduct, ProductCategory, SaveManagedProductDto } from "../model/ManagedProduct";

export interface IProductsRepository {
  listByBusiness(businessId: number, token: string): Promise<ManagedProduct[]>;
  getById(productId: number, token: string): Promise<ManagedProduct | null>;
  create(payload: SaveManagedProductDto, token: string): Promise<ManagedProduct>;
  update(payload: SaveManagedProductDto, token: string): Promise<ManagedProduct>;
  archive(productId: number, token: string): Promise<void>;

  listCategoriesByBusiness(businessId: number, token: string): Promise<ProductCategory[]>;
  createCategory(category: ProductCategory, token: string): Promise<ProductCategory>;
  updateCategory(category: ProductCategory, token: string): Promise<ProductCategory>;
  deleteCategory(categoryId: number, token: string): Promise<void>;
}
