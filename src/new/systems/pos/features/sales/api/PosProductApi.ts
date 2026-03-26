import { HttpClient } from "../../../../core/api/HttpClient";
import { POS_ENDPOINTS } from "../../../shared/api/posEndpoints";
import { toPaginationMeta } from "../../../shared/model/Pagination";
import { IProductRepository, ProductCategory, SalesProductsPaginatedResult } from "../interface/IProductRepository";
import { CreateProductDto, Product } from "../model/Product";

type ProductResponse = {
  Id: number;
  Business_Id: number;
  Category_Id?: number | null;
  Category_Name?: string | null;
  Name: string;
  Price?: number | null;
  Stock?: number | null;
  Image?: string | null;
  Images?: string[] | null;
  ForSale?: boolean;
  Available?: boolean;
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
    let [withoutStock, withStock] = await Promise.all([
      this.httpClient.request<ProductResponse[]>({
        method: "GET",
        path: POS_ENDPOINTS.productsStockNull(businessId),
        token,
      }),
      this.httpClient.request<ProductResponse[]>({
        method: "GET",
        path: POS_ENDPOINTS.productsStockGtZero(businessId),
        token,
      }),
    ]);

    if (!withoutStock) withoutStock = [];
    if (!withStock) withStock = [];

    return [...withoutStock, ...withStock].map((item) => this.toDomain(item));
  }

  async listAvailableByBusinessPaginated(
    businessId: number,
    token: string,
    limit: string,
    page: number,
  ): Promise<SalesProductsPaginatedResult> {
    const payload = await this.httpClient.request<SalesProductsPayload>({
      method: "POST",
      path: POS_ENDPOINTS.productsStockAvailableGtZero(businessId),
      token,
      query: { page },
      body: { Limit: limit },
    });

    return this.toPaginatedResult(payload, page, 20);
  }

  async listByCategoryPaginated(
    categoryId: number,
    token: string,
    limit: string,
    page: number,
  ): Promise<SalesProductsPaginatedResult> {
    const payload = await this.httpClient.request<SalesProductsPayload>({
      method: "GET",
      path: POS_ENDPOINTS.productsByCategory(categoryId),
      token,
      query: { limit, page },
    });

    return this.toPaginatedResult(payload, page, 20);
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
      path: POS_ENDPOINTS.products(),
      token,
      body: { Product: payload, Variants: null },
    });

    return this.toDomain(created);
  }

  private toPaginatedResult(payload: SalesProductsPayload, page: number, fallbackPageSize: number): SalesProductsPaginatedResult {
    const rows = Array.isArray(payload) ? payload : payload.products ?? payload.data ?? [];
    const paginationPayload = Array.isArray(payload) ? undefined : payload.pagination;
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
      item.Image ?? null,
      Array.isArray(item.Images) ? item.Images.filter(Boolean) : [],
      item.ForSale ?? true,
      item.Available ?? true,
    );
  }
}
