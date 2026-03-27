import { IProductRepository, SalesProductsPaginatedResult } from "../interface/IProductRepository";
import { CreateProductDto, Product } from "../model/Product";

export class ProductService {
  constructor(private readonly repository: IProductRepository) {}

  async getSellableProducts(businessId: number, token: string): Promise<Product[]> {
    const [products, categories] = await Promise.all([
      this.repository.listByBusiness(businessId, token),
      this.repository.listCategoriesByBusiness(businessId, token).catch(() => []),
    ]);

    const categoryById = new Map(categories.map((category) => [category.id, category.name]));

    return products
      .filter((product) => product.hasStock() && product.canBeSold())
      .map((product) => {
        const resolvedCategory = product.categoryName || (product.categoryId ? categoryById.get(product.categoryId) : undefined) || "General";

        return new Product(
          product.id,
          product.businessId,
          product.name,
          product.price,
          product.stock,
          product.categoryId,
          resolvedCategory,
          product.color,
          product.image,
          product.images,
          product.forSale,
          product.available,
          product.variants,
        );
      });
  }

  async getSellableProductsPaginated(
    businessId: number,
    token: string,
    limit: string,
    page: number,
    categoryId?: number | null,
  ): Promise<SalesProductsPaginatedResult> {
    const response = categoryId
      ? await this.repository.listByCategoryPaginated(categoryId, token, limit, page)
      : await this.repository.listAvailableByBusinessPaginated(businessId, token, limit, page);

    return {
      products: response.products.filter((product) => product.hasStock() && product.canBeSold()),
      pagination: response.pagination,
    };
  }


  async getBusinessCategories(businessId: number, token: string) {
    return this.repository.listCategoriesByBusiness(businessId, token);
  }

  async createProduct(payload: CreateProductDto, token: string): Promise<Product> {
    return this.repository.create(payload, token);
  }
}
