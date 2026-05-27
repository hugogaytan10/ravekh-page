import { CatalogService } from "../services/CatalogService";

export class CatalogPublishingPage {
  constructor(private readonly service: CatalogService) {}

  async loadPublishedProducts(businessId: number, token: string): Promise<Array<{ id: number; title: string; description: string }>> {
    const products = await this.service.getPublishedProducts(businessId, token);
    return products.map((product) => ({ id: product.id, title: product.title, description: product.description }));
  }

  async publishProduct(
    businessId: number,
    payload: { title: string; description: string },
    token: string,
  ): Promise<{ id: number; title: string; description: string }> {
    const product = await this.service.publishProduct({
      businessId,
      title: payload.title,
      description: payload.description,
    }, token);

    return {
      id: product.id,
      title: product.title,
      description: product.description,
    };
  }
}
