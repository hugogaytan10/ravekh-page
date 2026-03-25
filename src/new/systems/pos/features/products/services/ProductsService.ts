import { IProductsRepository } from "../interface/IProductsRepository";
import { ManagedProduct, ProductCategory, SaveManagedProductDto } from "../model/ManagedProduct";

export class ProductsService {
  constructor(private readonly repository: IProductsRepository) {}

  async listProducts(businessId: number, token: string): Promise<ManagedProduct[]> {
    return this.repository.listByBusiness(businessId, token);
  }

  async getProduct(productId: number, token: string): Promise<ManagedProduct | null> {
    return this.repository.getById(productId, token);
  }

  async saveProduct(payload: SaveManagedProductDto, token: string): Promise<ManagedProduct> {
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

  async importProducts(businessId: number, file: File, token: string): Promise<{ imported: number; message: string }> {
    return this.repository.importProducts(businessId, file, token);
  }
}
