import { ProductsService } from "../services/ProductsService";
import { SaveManagedProductDto } from "../model/ManagedProduct";

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
}
