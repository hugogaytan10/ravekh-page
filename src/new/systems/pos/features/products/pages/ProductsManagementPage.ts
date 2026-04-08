import { ProductsService } from "../services/ProductsService";
import { ProductCategory, SaveManagedProductDto } from "../model/ManagedProduct";

export class ProductsManagementPage {
  constructor(private readonly service: ProductsService) {}

  async loadProducts(businessId: number, token: string): Promise<Array<{ id: number; name: string; available: boolean }>> {
    const products = await this.service.listProducts(businessId, token);

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      available: product.available,
    }));
  }

  async saveProduct(payload: SaveManagedProductDto, token: string): Promise<{ id: number; name: string; available: boolean }> {
    const saved = await this.service.saveProduct(payload, token);
    return { id: saved.id, name: saved.name, available: saved.available };
  }

  async archiveProduct(productId: number, token: string): Promise<void> {
    await this.service.archiveProduct(productId, token);
  }

  async loadCategories(businessId: number, token: string): Promise<Array<{ id: number; name: string; color: string }>> {
    const categories = await this.service.listCategories(businessId, token);
    return categories.map((category) => ({
      id: category.id ?? 0,
      name: category.name,
      color: category.color,
    }));
  }

  async createCategory(category: ProductCategory, token: string): Promise<{ id: number; name: string; color: string }> {
    const saved = await this.service.createCategory(category, token);
    return {
      id: saved.id ?? 0,
      name: saved.name,
      color: saved.color,
    };
  }

  async updateCategory(category: ProductCategory, token: string): Promise<{ id: number; name: string; color: string }> {
    const saved = await this.service.updateCategory(category, token);
    return {
      id: saved.id ?? 0,
      name: saved.name,
      color: saved.color,
    };
  }

  async deleteCategory(categoryId: number, token: string): Promise<void> {
    await this.service.deleteCategory(categoryId, token);
  }

  async importProducts(businessId: number, file: File, token: string): Promise<{ imported: number; message: string }> {
    return this.service.importProducts(businessId, file, token);
  }
}
