import { IProductsRepository, ProductImportResult, ProductsPaginatedResult } from "../interface/IProductsRepository";
import { ManagedProduct, ProductCategory, SaveManagedProductDto } from "../model/ManagedProduct";

export class ProductsService {
  constructor(private readonly repository: IProductsRepository) {}

  async listProducts(businessId: number, token: string): Promise<ManagedProduct[]> {
    return this.repository.listByBusiness(businessId, token);
  }

  async listAllProducts(businessId: number, token: string, limit: string): Promise<ManagedProduct[]> {
    return this.repository.listAllByBusiness(businessId, token, limit);
  }

  async listProductsPaginated(businessId: number, token: string, page: number, limit: string | number): Promise<ProductsPaginatedResult> {
    return this.repository.listByBusinessPaginated(businessId, token, page, limit);
  }

  async listProductsAllForSearch(businessId: number, token: string, limit: string | number): Promise<ManagedProduct[]> {
    return this.repository.listByBusinessAllForSearch(businessId, token, limit);
  }

  async getProduct(productId: number, token: string): Promise<ManagedProduct | null> {
    return this.repository.getById(productId, token);
  }

  async saveProduct(payload: SaveManagedProductDto, token: string): Promise<ManagedProduct> {
    console.log("Saving product with payload:", payload);
    return payload.id ? this.repository.update(payload, token) : this.repository.create(payload, token);
  }

  async archiveProduct(productId: number, token: string): Promise<void> {
    return this.repository.archive(productId, token);
  }

  async listCategories(businessId: number, token: string): Promise<ProductCategory[]> {
    return this.repository.listCategoriesByBusiness(businessId, token);
  }

  async createCategory(category: ProductCategory, token: string): Promise<ProductCategory> {
    return this.repository.createCategory(category, token);
  }

  async updateCategory(category: ProductCategory, token: string): Promise<ProductCategory> {
    return this.repository.updateCategory(category, token);
  }

  async deleteCategory(categoryId: number, token: string): Promise<void> {
    return this.repository.deleteCategory(categoryId, token);
  }

  async importProducts(businessId: number, file: File, token: string): Promise<ProductImportResult> {
    return this.repository.importProducts(businessId, file, token);
  }

  async importProductsZip(businessId: number, file: File, token: string): Promise<ProductImportResult> {
    return this.repository.importProductsZip(businessId, file, token);
  }
}
