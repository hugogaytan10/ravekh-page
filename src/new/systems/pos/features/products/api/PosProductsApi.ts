import { HttpClient } from "../../../../core/api/HttpClient";
import { IProductsRepository } from "../interface/IProductsRepository";
import { ManagedProduct, ProductVariant, SaveManagedProductDto } from "../model/ManagedProduct";

type ProductResponse = {
  Id?: number;
  Business_Id: number;
  Category_Id?: number | null;
  Name: string;
  Description?: string;
  ForSale?: boolean;
  ShowInStore?: boolean;
  Available?: boolean | number | string | null;
  Image?: string;
  Images?: string[];
  Barcode?: string | null;
  Price?: number | null;
  CostPerItem?: number | null;
  Stock?: number | null;
  Variants?: ProductVariant[];
};

export class PosProductsApi implements IProductsRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async listByBusiness(businessId: number, token: string): Promise<ManagedProduct[]> {
    const products = await this.httpClient.request<ProductResponse[]>({
      method: "GET",
      path: `products/business/${businessId}`,
      token,
    });

    return (Array.isArray(products) ? products : []).map((product) => this.toDomain(product));
  }

  async getById(productId: number, token: string): Promise<ManagedProduct | null> {
    const product = await this.httpClient.request<ProductResponse | null>({
      method: "GET",
      path: `products/${productId}`,
      token,
    });

    if (!product) {
      return null;
    }

    return this.toDomain(product);
  }

  async create(payload: SaveManagedProductDto, token: string): Promise<ManagedProduct> {
    await this.httpClient.request<void>({
      method: "POST",
      path: "products",
      token,
      body: {
        Product: this.toLegacy(payload),
        Variants: payload.variants ?? null,
      },
    });

    return new ManagedProduct(
      payload.id ?? 0,
      payload.businessId,
      payload.name,
      payload.description,
      payload.forSale,
      payload.showInStore,
      payload.available,
      payload.categoryId ?? null,
      payload.price ?? null,
      payload.costPerItem ?? null,
      payload.stock ?? null,
      payload.image ?? null,
      payload.images ?? [],
      payload.barcode ?? null,
      payload.variants ?? [],
    );
  }

  async update(payload: SaveManagedProductDto, token: string): Promise<ManagedProduct> {
    if (!payload.id) {
      throw new Error("Product id is required for updates.");
    }

    const updated = await this.httpClient.request<ProductResponse>({
      method: "PUT",
      path: `products/${payload.id}`,
      token,
      body: this.toLegacy(payload),
    });

    return this.toDomain(updated);
  }


  private toAvailabilityFlag(value: ProductResponse["Available"]): boolean {
    if (value === null || value === false || value === 0 || value === "0") return false;
    if (value === true || value === 1 || value === "1") return true;
    return value === undefined ? true : Boolean(value);
  }

  async archive(productId: number, token: string): Promise<void> {
    await this.httpClient.request<void>({
      method: "PUT",
      path: `products/available/${productId}`,
      token,
      body: { Available: false },
    });
  }

  private toDomain(product: ProductResponse): ManagedProduct {
    return new ManagedProduct(
      product.Id ?? 0,
      product.Business_Id,
      product.Name,
      product.Description ?? "",
      product.ForSale ?? true,
      product.ShowInStore ?? true,
      this.toAvailabilityFlag(product.Available),
      product.Category_Id ?? null,
      product.Price ?? null,
      product.CostPerItem ?? null,
      product.Stock ?? null,
      product.Image ?? null,
      product.Images ?? [],
      product.Barcode ?? null,
      product.Variants ?? [],
    );
  }

  private toLegacy(payload: SaveManagedProductDto): ProductResponse {
    return {
      Id: payload.id,
      Business_Id: payload.businessId,
      Category_Id: payload.categoryId,
      Name: payload.name,
      Description: payload.description,
      ForSale: payload.forSale,
      ShowInStore: payload.showInStore,
      Available: payload.available,
      Image: payload.image,
      Images: payload.images,
      Barcode: payload.barcode,
      Price: payload.price,
      CostPerItem: payload.costPerItem,
      Stock: payload.stock,
    };
  }
}
