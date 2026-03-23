import { HttpClient } from "../../../../core/api/HttpClient";
import { IProductsRepository } from "../interface/IProductsRepository";
import { ManagedProduct, ProductCategory, ProductExtra, ProductVariant, SaveManagedProductDto } from "../model/ManagedProduct";

type ProductResponse = {
  Id?: number;
  id?: number;
  Business_Id?: number;
  business_Id?: number;
  businessId?: number;
  Category_Id?: number | null;
  category_Id?: number | null;
  categoryId?: number | null;
  Category_Name?: string | null;
  category_Name?: string | null;
  categoryName?: string | null;
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
  Size?: string | null;
  size?: string | null;
  Talla?: string | null;
  talla?: string | null;
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

type ExtraResponse = {
  Id?: number;
  id?: number;
  Product_Id?: number;
  product_Id?: number;
  ProductId?: number;
  productId?: number;
  Description?: string;
  description?: string;
  Type?: string;
  type?: string;
};

type CategoryResponse = {
  Id?: number;
  id?: number;
  Business_Id?: number;
  business_Id?: number;
  Parent_Id?: number | null;
  parent_Id?: number | null;
  Name?: string;
  name?: string;
  Color?: string;
  color?: string;
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
    const [product, extrasResponse] = await Promise.all([
      this.httpClient.request<ProductResponse | { data?: ProductResponse; Data?: ProductResponse } | null>({
        method: "GET",
        path: `products/${productId}`,
        token,
      }),
      this.httpClient.request<unknown>({
        method: "GET",
        path: `extras/product/${productId}`,
        token,
      }).catch(() => null),
    ]);

    if (!product) {
      return null;
    }

    const normalized = "data" in product || "Data" in product ? product.data ?? product.Data ?? null : product;
    if (!normalized) return null;

    return this.toDomain(normalized, this.toDomainExtras(extrasResponse));
  }

  async create(payload: SaveManagedProductDto, token: string): Promise<ManagedProduct> {
    const response = await this.httpClient.request<ProductResponse | { Product?: ProductResponse; product?: ProductResponse; Id?: number; id?: number } | null>({
      method: "POST",
      path: "products",
      token,
      body: {
        Product: this.toLegacy(payload),
        Variants: payload.variants?.length ? payload.variants.map((variant) => this.toLegacyVariant(variant)) : null,
        Extras: payload.extras?.length ? payload.extras.map((extra) => this.toLegacyCreateExtra(extra)) : null,
      },
    });

    const created = this.extractCreatedProduct(response);
    if (created) {
      return this.toDomain(created, this.extractCreatedExtras(response));
    }

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
      null,
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
      payload.extras ?? [],
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

    if (payload.extras?.length) {
      await Promise.all(
        payload.extras
          .filter((extra) => extra.description.trim().length > 0)
          .map((extra) => this.httpClient.request<void>({
            method: "POST",
            path: "extras",
            token,
            body: this.toLegacyPersistedExtra(payload.id as number, extra),
          })),
      );
    }

    if (!updated) {
      return this.toDomain(this.toLegacy(payload), payload.extras ?? []);
    }

    return this.toDomain(updated, payload.extras ?? []);
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

  async listCategoriesByBusiness(businessId: number, token: string): Promise<ProductCategory[]> {
    const payload = await this.httpClient.request<CategoryResponse[] | { data?: CategoryResponse[]; Data?: CategoryResponse[] }>({
      method: "GET",
      path: `categories/business/${businessId}`,
      token,
    });

    const rows = Array.isArray(payload)
      ? payload
      : payload.data ?? payload.Data ?? [];

    return rows.map((category) => this.toDomainCategory(category));
  }

  async createCategory(category: ProductCategory, token: string): Promise<ProductCategory> {
    const response = await this.httpClient.request<CategoryResponse | null>({
      method: "POST",
      path: "categories",
      token,
      body: this.toLegacyCategory(category),
    });

    return response ? this.toDomainCategory(response) : category;
  }

  async updateCategory(category: ProductCategory, token: string): Promise<ProductCategory> {
    if (!category.id) {
      throw new Error("Category id is required for updates.");
    }

    const response = await this.httpClient.request<CategoryResponse | null>({
      method: "PUT",
      path: `categories/${category.id}`,
      token,
      body: this.toLegacyCategory(category),
    });

    return response ? this.toDomainCategory(response) : category;
  }

  async deleteCategory(categoryId: number, token: string): Promise<void> {
    await this.httpClient.request<void>({
      method: "DELETE",
      path: `categories/${categoryId}`,
      token,
      body: { Available: false },
    });
  }

  private toDomain(product: ProductResponse, extras: ProductExtra[] = []): ManagedProduct {
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
      product.Category_Name ?? product.category_Name ?? product.categoryName ?? null,
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
      extras,
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
      size: variant.Size ?? variant.size ?? variant.Talla ?? variant.talla ?? null,
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
    const normalizedSize = variant.size ?? null;

    return {
      Id: variant.id,
      Product_Id: variant.productId,
      Description: variant.description,
      Barcode: variant.barcode ?? null,
      Color: variant.color ?? null,
      ...(normalizedSize ? { Size: normalizedSize, Talla: normalizedSize } : {}),
      Price: variant.price ?? null,
      PromotionPrice: variant.promotionPrice ?? null,
      CostPerItem: variant.costPerItem ?? null,
      Stock: variant.stock ?? null,
      ExpDate: variant.expDate ?? null,
      MinStock: variant.minStock ?? null,
      OptStock: variant.optStock ?? null,
    };
  }

  private toDomainExtras(payload: unknown): ProductExtra[] {
    if (!payload || typeof payload !== "object") return [];

    const record = payload as Record<string, unknown>;
    const colorRows = Array.isArray(record.COLOR) ? record.COLOR : [];
    const sizeRows = Array.isArray(record.TALLA) ? record.TALLA : [];

    return [...colorRows, ...sizeRows]
      .filter((row) => row && typeof row === "object")
      .map((row) => this.toDomainExtra(row as ExtraResponse));
  }

  private toDomainExtra(extra: ExtraResponse): ProductExtra {
    return {
      id: extra.Id ?? extra.id,
      productId: extra.Product_Id ?? extra.product_Id ?? extra.ProductId ?? extra.productId,
      description: String(extra.Description ?? extra.description ?? "").trim(),
      type: String(extra.Type ?? extra.type ?? "").trim() || "COLOR",
    };
  }

  private toLegacyCreateExtra(extra: ProductExtra): { Description: string; Type: string } {
    return {
      Description: extra.description.trim(),
      Type: extra.type,
    };
  }

  private toLegacyPersistedExtra(productId: number, extra: ProductExtra): { Product_Id: number; Description: string; Type: string } {
    return {
      Product_Id: productId,
      Description: extra.description.trim(),
      Type: extra.type,
    };
  }

  private extractCreatedProduct(response: ProductResponse | { Product?: ProductResponse; product?: ProductResponse; Id?: number; id?: number } | null): ProductResponse | null {
    if (!response || typeof response !== "object") return null;
    if ("Product" in response && response.Product) return response.Product;
    if ("product" in response && response.product) return response.product;
    return response as ProductResponse;
  }

  private extractCreatedExtras(response: unknown): ProductExtra[] {
    if (!response || typeof response !== "object") return [];
    const record = response as Record<string, unknown>;
    if (!Array.isArray(record.Extras)) return [];
    return record.Extras
      .filter((row) => row && typeof row === "object")
      .map((row) => this.toDomainExtra(row as ExtraResponse));
  }

  private toLegacyCategory(category: ProductCategory): CategoryResponse {
    return {
      Id: category.id,
      Business_Id: category.businessId,
      Parent_Id: category.parentId ?? null,
      Name: category.name,
      Color: category.color,
    };
  }

  private toDomainCategory(category: CategoryResponse): ProductCategory {
    return {
      id: category.Id ?? category.id,
      businessId: category.Business_Id ?? category.business_Id ?? 0,
      parentId: category.Parent_Id ?? category.parent_Id ?? null,
      name: category.Name ?? category.name ?? "",
      color: category.Color ?? category.color ?? "",
    };
  }
}
