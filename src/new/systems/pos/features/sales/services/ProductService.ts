import { IProductRepository } from "../interface/IProductRepository";
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
          product.image,
          product.images,
          product.forSale,
          product.available,
        );
      });
  }

  async createProduct(payload: CreateProductDto, token: string): Promise<Product> {
    return this.repository.create(payload, token);
  }
}
