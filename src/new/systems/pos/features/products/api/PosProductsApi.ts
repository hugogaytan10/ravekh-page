import { HttpClient } from "../../../../core/api/HttpClient";
import { IProductsRepository } from "../interface/IProductsRepository";
import { ManagedProduct, ProductVariant, SaveManagedProductDto } from "../model/ManagedProduct";

type ProductResponse = {
  Id?: number;
  id?: number;
  Business_Id?: number;
  business_Id?: number;
  businessId?: number;
  Category_Id?: number | null;
  category_Id?: number | null;
  categoryId?: number | null;
  Name?: string;
  name?: string;
  Description?: string;
  description?: string;
  Color?: string | null;
  color?: string | null;
  ForSale?: boolean;
  forSale?: boolean;
  ShowInStore?: boolean;
  showInStore?: boolean;
  Available?: boolean | number | string | null;
  available?: boolean | number | string | null;
  Volume?: boolean;
  volume?: boolean;
  Image?: string;
  image?: string;
  Images?: string[];
  images?: string[];
  Barcode?: string | null;
  barcode?: string | null;
  Price?: number | null;
  price?: number | null;
  PromotionPrice?: number | null;
  promotionPrice?: number | null;
  CostPerItem?: number | null;
  costPerItem?: number | null;
  Stock?: number | null;
  stock?: number | null;
  ExpDate?: string | null;
  expDate?: string | null;
  MinStock?: number | null;
  minStock?: number | null;
  OptStock?: number | null;
  optStock?: number | null;
  Quantity?: number | null;
  quantity?: number | null;
  Variants?: LegacyVariantResponse[];
  variants?: LegacyVariantResponse[];
};

type LegacyVariantResponse = {
  Id?: number;
  id?: number;
  Product_Id?: number;
  product_Id?: number;
  Description?: string;
  description?: string;
  Barcode?: string | null;
  barcode?: string | null;
  Color?: string | null;
  color?: string | null;
  Price?: number | null;
  price?: number | null;
  PromotionPrice?: number | null;
  promotionPrice?: number | null;
  CostPerItem?: number | null;
  costPerItem?: number | null;
  Stock?: number | null;
  stock?: number | null;
  ExpDate?: string | null;
  expDate?: string | null;
  MinStock?: number | null;
  minStock?: number | null;
  OptStock?: number | null;
  optStock?: number | null;
};

export class PosProductsApi implements IProductsRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async listByBusiness(businessId: number, token: string): Promise<ManagedProduct[]> {
    const products = await this.httpClient.request<ProductResponse[] | { data?: ProductResponse[]; Data?: ProductResponse[]; Products?: ProductResponse[] }>({
      method: "GET",
      path: `products/business/${businessId}`,
      token,
    });

    const rows = Array.isArray(products)
      ? products
      : products.data ?? products.Data ?? products.Products ?? [];

    return rows.map((product) => this.toDomain(product));
  }

  async getById(productId: number, token: string): Promise<ManagedProduct | null> {
    const product = await this.httpClient.request<ProductResponse | { data?: ProductResponse; Data?: ProductResponse } | null>({
      method: "GET",
      path: `products/${productId}`,
      token,
    });

    if (!product) {
      return null;
    }

    const normalized = "data" in product || "Data" in product ? product.data ?? product.Data ?? null : product;
    return normalized ? this.toDomain(normalized) : null;
  }

  async create(payload: SaveManagedProductDto, token: string): Promise<ManagedProduct> {
    await this.httpClient.request<void>({
      method: "POST",
      path: "products",
      token,
      body: {
        Product: this.toLegacy(payload),
        Variants: payload.variants?.length ? payload.variants.map((variant) => this.toLegacyVariant(variant)) : null,
      },
    });

    return new ManagedProduct(
      payload.id ?? 0,
      payload.businessId,
      payload.name,
      payload.description,
      payload.color ?? null,
      payload.forSale,
      payload.showInStore,
      payload.available,
      payload.volume ?? false,
      payload.categoryId ?? null,
      payload.price ?? null,
      payload.promotionPrice ?? null,
      payload.costPerItem ?? null,
      payload.stock ?? null,
      payload.expDate ?? null,
      payload.minStock ?? null,
      payload.optStock ?? null,
      payload.quantity ?? null,
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

    const updated = await this.httpClient.request<ProductResponse | null>({
      method: "PUT",
      path: `products/${payload.id}`,
      token,
      body: {
        Product: this.toLegacy(payload),
        Variants: payload.variants?.length ? payload.variants.map((variant) => this.toLegacyVariant(variant)) : null,
      },
    });

    if (!updated) {
      return this.toDomain(this.toLegacy(payload));
    }

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
    const variants = product.Variants ?? product.variants ?? [];
    return new ManagedProduct(
      product.Id ?? product.id ?? 0,
      product.Business_Id ?? product.business_Id ?? product.businessId ?? 0,
      product.Name ?? product.name ?? "",
      product.Description ?? product.description ?? "",
      product.Color ?? product.color ?? null,
      product.ForSale ?? product.forSale ?? true,
      product.ShowInStore ?? product.showInStore ?? true,
      this.toAvailabilityFlag(product.Available ?? product.available),
      product.Volume ?? product.volume ?? false,
      product.Category_Id ?? product.category_Id ?? product.categoryId ?? null,
      product.Price ?? product.price ?? null,
      product.PromotionPrice ?? product.promotionPrice ?? null,
      product.CostPerItem ?? product.costPerItem ?? null,
      product.Stock ?? product.stock ?? null,
      product.ExpDate ?? product.expDate ?? null,
      product.MinStock ?? product.minStock ?? null,
      product.OptStock ?? product.optStock ?? null,
      product.Quantity ?? product.quantity ?? null,
      product.Image ?? product.image ?? null,
      product.Images ?? product.images ?? [],
      product.Barcode ?? product.barcode ?? null,
      variants.map((variant) => this.toDomainVariant(variant)),
    );
  }

  private toLegacy(payload: SaveManagedProductDto): ProductResponse {
    return {
      Id: payload.id,
      Business_Id: payload.businessId,
      Category_Id: payload.categoryId,
      Name: payload.name,
      Description: payload.description,
      Color: payload.color ?? null,
      ForSale: payload.forSale,
      ShowInStore: payload.showInStore,
      Available: payload.available,
      Image: payload.image,
      Images: payload.images,
      Barcode: payload.barcode,
      Price: payload.price,
      PromotionPrice: payload.promotionPrice ?? null,
      CostPerItem: payload.costPerItem,
      Stock: payload.stock,
      ExpDate: payload.expDate ?? null,
      MinStock: payload.minStock ?? null,
      OptStock: payload.optStock ?? null,
      Quantity: payload.quantity ?? null,
      Volume: payload.volume ?? false,
    };
  }

  private toDomainVariant(variant: LegacyVariantResponse): ProductVariant {
    return {
      id: variant.Id ?? variant.id,
      productId: variant.Product_Id ?? variant.product_Id,
      description: variant.Description ?? variant.description ?? "",
      barcode: variant.Barcode ?? variant.barcode ?? null,
      color: variant.Color ?? variant.color ?? null,
      price: variant.Price ?? variant.price ?? null,
      promotionPrice: variant.PromotionPrice ?? variant.promotionPrice ?? null,
      costPerItem: variant.CostPerItem ?? variant.costPerItem ?? null,
      stock: variant.Stock ?? variant.stock ?? null,
      expDate: variant.ExpDate ?? variant.expDate ?? null,
      minStock: variant.MinStock ?? variant.minStock ?? null,
      optStock: variant.OptStock ?? variant.optStock ?? null,
    };
  }

  private toLegacyVariant(variant: ProductVariant): LegacyVariantResponse {
    return {
      Id: variant.id,
      Product_Id: variant.productId,
      Description: variant.description,
      Barcode: variant.barcode ?? null,
      Color: variant.color ?? null,
      Price: variant.price ?? null,
      PromotionPrice: variant.promotionPrice ?? null,
      CostPerItem: variant.costPerItem ?? null,
      Stock: variant.stock ?? null,
      ExpDate: variant.expDate ?? null,
      MinStock: variant.minStock ?? null,
      OptStock: variant.optStock ?? null,
    };
  }
}
