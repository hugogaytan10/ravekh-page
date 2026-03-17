import { CatalogService } from "../services/CatalogService";

export class CatalogPublishingPage {
  constructor(private readonly service: CatalogService) {}

  async loadPublishedProducts(businessId: number, token: string): Promise<Array<{ id: number; title: string; description: string }>> {
    const products = await this.service.getPublishedProducts(businessId, token);
    return products.map((product) => ({ id: product.id, title: product.title, description: product.description }));
  }
}
