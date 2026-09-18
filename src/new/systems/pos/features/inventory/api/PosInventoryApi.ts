import { HttpClient } from "../../../../core/api/HttpClient";
import { POS_ENDPOINTS } from "../../../shared/api/posEndpoints";
import { toPaginationMeta } from "../../../shared/model/Pagination";
import { IInventoryRepository, InventoryPaginatedResult } from "../interface/IInventoryRepository";
import { InventoryItem, UpdateInventoryStockDto } from "../model/InventoryItem";

type ProductResponse = {
  Id: number;
  Business_Id: number;
  Name: string;
  Stock: number;
  Price: number;
};

export class PosInventoryApi implements IInventoryRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async listByBusiness(businessId: number, token: string): Promise<InventoryItem[]> {
    const first = await this.httpClient.request<ProductResponse[] | { data?: ProductResponse[]; pagination?: Record<string, unknown> }>({
      method: "GET",
      path: POS_ENDPOINTS.productsByBusinessBranch(businessId),
      token,
      query: { page: 1, limit: "MAX" },
    });
    const firstRows = Array.isArray(first) ? first : first.data ?? [];
    const totalPages = Array.isArray(first) ? 1 : Math.max(1, Number(first.pagination?.totalPages ?? 1));
    const rest = totalPages > 1 ? await Promise.all(Array.from({ length: totalPages - 1 }, (_, index) => this.httpClient.request<ProductResponse[] | { data?: ProductResponse[] }>({
      method: "GET", path: POS_ENDPOINTS.productsByBusinessBranch(businessId), token, query: { page: index + 2, limit: "MAX" },
    }))) : [];
    const rows = [...firstRows, ...rest.flatMap((page) => Array.isArray(page) ? page : page.data ?? [])];
    return rows.map((item) => this.toDomain(item));
  }

  async listByBusinessPaginated(businessId: number, token: string, page: number, limit: number): Promise<InventoryPaginatedResult> {
    const payload = await this.httpClient.request<
      ProductResponse[] |
      { products?: ProductResponse[]; data?: ProductResponse[]; pagination?: Record<string, unknown> }
    >({
      method: "GET",
      path: POS_ENDPOINTS.productsByBusinessBranch(businessId),
      token,
      query: { page, limit },
    });

    const rows = Array.isArray(payload) ? payload : payload.products ?? payload.data ?? [];
    const paginationPayload = Array.isArray(payload) ? undefined : payload.pagination;

    return {
      items: rows.map((item) => this.toDomain(item)),
      pagination: toPaginationMeta(paginationPayload, page, limit, rows.length),
    };
  }

  async updateStock(productId: number, payload: UpdateInventoryStockDto, token: string): Promise<void> {
    await this.httpClient.request<void>({
      method: "PATCH",
      path: POS_ENDPOINTS.branchProductInventory(productId),
      token,
      body: { Stock: payload.stock },
    });
  }

  private toDomain(item: ProductResponse): InventoryItem {
    return new InventoryItem(item.Id, item.Business_Id, item.Name, item.Stock, item.Price);
  }
}
