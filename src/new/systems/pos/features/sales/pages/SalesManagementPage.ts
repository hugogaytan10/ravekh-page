import { ProductService } from "../services/ProductService";

export class SalesManagementPage {
  constructor(private readonly service: ProductService) {}

  async getCatalogPreview(businessId: number, token: string): Promise<Array<{ id: number; name: string; stock: number }>> {
    const products = await this.service.getSellableProducts(businessId, token);
    return products.map((product) => ({ id: product.id, name: product.name, stock: product.stock }));
  }

  async getCatalogPreviewPaginated(
    businessId: number,
    token: string,
    limit: string,
    page: number,
    categoryId?: number | null,
  ): Promise<{
    products: Array<{ id: number; name: string; stock: number }>;
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
      categoryIds: number[];
    };
  }> {
    const response = await this.service.getSellableProductsPaginated(businessId, token, limit, page, categoryId);

    return {
      products: response.products.map((product) => ({ id: product.id, name: product.name, stock: product.stock })),
      pagination: response.pagination,
    };
  }
}
