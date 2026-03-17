import { ProductService } from "../services/ProductService";

export class SalesManagementPage {
  constructor(private readonly service: ProductService) {}

  async getCatalogPreview(businessId: number, token: string): Promise<Array<{ id: number; name: string; stock: number }>> {
    const products = await this.service.getSellableProducts(businessId, token);
    return products.map((product) => ({ id: product.id, name: product.name, stock: product.stock }));
  }
}
