import { HttpClient } from "../../../../core/api/HttpClient";
import { POS_ENDPOINTS } from "../../../shared/api/posEndpoints";
import { toPaginationMeta } from "../../../shared/model/Pagination";
import { IProductRepository, ProductCategory, SalesProductsPaginatedResult } from "../interface/IProductRepository";
import { CreateProductDto, Product, SalesProductVariant } from "../model/Product";

type LegacyVariantResponse = {
  Id?: number | null;
  Description?: string | null;
  Color?: string | null;
  Size?: string | null;
  Talla?: string | null;
  Price?: number | null;
  PromotionPrice?: number | null;
  Stock?: number | null;
};

type ProductResponse = {
  Id: number;
  Business_Id: number;
  Category_Id?: number | null;
  Category_Name?: string | null;
  Name: string;
  Color?: string | null;
  Price?: number | null;
  Stock?: number | null;
  Image?: string | null;
  Images?: string[] | null;
  ForSale?: boolean;
  Available?: boolean;
  Variants?: LegacyVariantResponse[] | null;
};

type CategoryResponse = {
  Id?: number;
  Name?: string;
};

type SalesProductsPayload = ProductResponse[] | {
  products?: ProductResponse[];
  data?: ProductResponse[];
  pagination?: Record<string, unknown>;
};

export class PosProductApi implements IProductRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async listByBusiness(businessId: number, token: string): Promise<Product[]> {
    return this.listAvailableByBusinessAll(businessId, token, "MAX");
  }

  async listAvailableByBusinessPaginated(
    businessId: number,
    token: string,
    limit: string,
    page: number,
  ): Promise<SalesProductsPaginatedResult> {
    const payload = await this.httpClient.request<SalesProductsPayload>({
      method: "GET",
      path: POS_ENDPOINTS.productsByBusinessBranch(businessId),
      token,
      query: { page, limit },
    });

    return this.toPaginatedResult(payload, page, 20);
  }

  async listByCategoryPaginated(
    categoryId: number,
    token: string,
    limit: string,
    page: number,
  ): Promise<SalesProductsPaginatedResult> {
    const sessionBusinessId = Number(window.localStorage.getItem("pos-v2-business-id") ?? 0);
    if (!sessionBusinessId) return { products: [], pagination: toPaginationMeta(undefined, page, 20, 0) };
    const all = await this.listAvailableByBusinessAll(sessionBusinessId, token, limit);
    const filtered = all.filter((product) => product.categoryId === categoryId);
    const pageSize = 20;
    const offset = (Math.max(page, 1) - 1) * pageSize;
    const rows = filtered.slice(offset, offset + pageSize);
    return {
      products: rows,
      pagination: {
        ...toPaginationMeta(undefined, page, pageSize, rows.length),
        total: filtered.length,
        totalPages: filtered.length ? Math.ceil(filtered.length / pageSize) : 0,
        hasNext: offset + pageSize < filtered.length,
        hasPrev: page > 1,
        categoryIds: [categoryId],
      },
    };
  }

  async listAvailableByBusinessAll(
    businessId: number,
    token: string,
    limit: string,
  ): Promise<Product[]> {
    const first = await this.httpClient.request<SalesProductsPayload>({
      method: "GET",
      path: POS_ENDPOINTS.productsByBusinessBranch(businessId),
      token,
      query: { page: 1, limit },
    });
    const firstRows = Array.isArray(first) ? first : first?.products ?? first?.data ?? [];
    if (Array.isArray(first)) return firstRows.map((item) => this.toDomain(item));

    const totalPages = Math.max(1, Number(first.pagination?.totalPages ?? 1));
    const pages = totalPages > 1
      ? await Promise.all(Array.from({ length: totalPages - 1 }, (_, index) => this.httpClient.request<SalesProductsPayload>({
          method: "GET",
          path: POS_ENDPOINTS.productsByBusinessBranch(businessId),
          token,
          query: { page: index + 2, limit },
        })))
      : [];
    const rows = [
      ...firstRows,
      ...pages.flatMap((payload) => Array.isArray(payload) ? payload : payload?.products ?? payload?.data ?? []),
    ];
    return rows.map((item) => this.toDomain(item));
  }

  async listCategoriesByBusiness(businessId: number, token: string): Promise<ProductCategory[]> {
    const categories = await this.httpClient.request<CategoryResponse[] | null>({
      method: "GET",
      path: POS_ENDPOINTS.categoriesByBusiness(businessId),
      token,
    });

    return (Array.isArray(categories) ? categories : [])
      .filter((item): item is CategoryResponse & { Id: number; Name: string } => Boolean(item?.Id && item?.Name))
      .map((item) => ({
        id: item.Id,
        name: item.Name.trim(),
      }));
  }

  async create(payload: CreateProductDto, token: string): Promise<Product> {
    const created = await this.httpClient.request<ProductResponse>({
      method: "POST",
      path: POS_ENDPOINTS.productsByBusinessBranch(payload.businessId),
      token,
      body: {
        Business_Id: payload.businessId,
        Name: payload.name,
        Price: payload.price,
        Stock: payload.stock,
        ForSale: 1,
        ShowInStore: 1,
        Available: 1,
        Showprice: 1,
      },
    });

    return this.toDomain(created);
  }

  private toPaginatedResult(payload: SalesProductsPayload, page: number, fallbackPageSize: number): SalesProductsPaginatedResult {
    const rows = Array.isArray(payload) ? payload : payload?.products ?? payload?.data ?? [];
    const paginationPayload = Array.isArray(payload) ? undefined : payload?.pagination;
    const categoryIds = Array.isArray(paginationPayload?.categoryIds)
      ? paginationPayload.categoryIds.map((id) => Number(id)).filter((id) => Number.isFinite(id))
      : [];

    return {
      products: rows.map((item) => this.toDomain(item)),
      pagination: {
        ...toPaginationMeta(paginationPayload, page, fallbackPageSize, rows.length),
        categoryIds,
      },
    };
  }

  private toDomain(item: ProductResponse): Product {
    const stock = typeof item.Stock === "number" && Number.isFinite(item.Stock) ? item.Stock : null;
    const price = typeof item.Price === "number" && Number.isFinite(item.Price) ? item.Price : 0;

    return new Product(
      item.Id,
      item.Business_Id,
      item.Name,
      price,
      stock,
      item.Category_Id ?? null,
      item.Category_Name?.trim() || "",
      item.Color?.trim() || null,
      item.Image ?? null,
      Array.isArray(item.Images) ? item.Images.filter(Boolean) : [],
      item.ForSale ?? true,
      item.Available ?? true,
      Array.isArray(item.Variants) ? item.Variants.map((variant) => this.toDomainVariant(variant)) : [],
    );
  }

  private toDomainVariant(variant: LegacyVariantResponse): SalesProductVariant {
    return {
      id: typeof variant.Id === "number" && Number.isFinite(variant.Id) ? variant.Id : null,
      description: (variant.Description ?? "").trim(),
      color: variant.Color?.trim() || null,
      size: variant.Size?.trim() || variant.Talla?.trim() || null,
      price: typeof variant.Price === "number" && Number.isFinite(variant.Price) ? variant.Price : null,
      promotionPrice: typeof variant.PromotionPrice === "number" && Number.isFinite(variant.PromotionPrice) ? variant.PromotionPrice : null,
      stock: typeof variant.Stock === "number" && Number.isFinite(variant.Stock) ? variant.Stock : null,
    };
  }
}
