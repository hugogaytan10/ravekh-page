import { HttpClient } from "../../../../shared/api/HttpClient";
import type { SalesGateway } from "../interfaces/SalesContracts";
import type { BusinessProfile, BusinessTax, SalesCategory, SalesProduct } from "../models/SalesModels";
import { SalesMapper } from "./SalesMapper";

export class PosSalesApi implements SalesGateway {
  constructor(private readonly httpClient: HttpClient) {}

  async getProducts(token: string, businessId: string): Promise<SalesProduct[]> {
    const [nullStock, stockGtZero] = await Promise.all([
      this.httpClient.request<unknown[]>(`products/stocknull/${businessId}`, { token }),
      this.httpClient.request<unknown[]>(`products/stockgtzero/${businessId}`, { token }),
    ]);

    const catalog = [...(Array.isArray(nullStock) ? nullStock : []), ...(Array.isArray(stockGtZero) ? stockGtZero : [])]
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"));

    const uniqueById = new Map<number, SalesProduct>();

    for (const product of catalog) {
      const mapped = SalesMapper.productFromLegacy(product);
      uniqueById.set(mapped.id, mapped);
    }

    return [...uniqueById.values()];
  }

  async getCategories(token: string, businessId: string): Promise<SalesCategory[]> {
    const response = await this.httpClient.request<unknown[]>(`categories/business/${businessId}`, { token });

    return (Array.isArray(response) ? response : [])
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
      .map((item) => SalesMapper.categoryFromLegacy(item));
  }

  async getBusiness(token: string, businessId: string): Promise<BusinessProfile | null> {
    const response = await this.httpClient.request<unknown>(`business/${businessId}`, { token });

    if (!response || typeof response !== "object") {
      return null;
    }

    return SalesMapper.businessFromLegacy(response as Record<string, unknown>);
  }

  async getTaxes(token: string, businessId: string): Promise<BusinessTax[]> {
    const response = await this.httpClient.request<unknown[]>(`taxes/business/${businessId}`, { token });

    return (Array.isArray(response) ? response : [])
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
      .map((item) => SalesMapper.taxFromLegacy(item));
  }
}
