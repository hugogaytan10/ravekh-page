import { IProductsRepository } from "../interface/IProductsRepository";
import { ManagedProduct, SaveManagedProductDto } from "../model/ManagedProduct";

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
}
