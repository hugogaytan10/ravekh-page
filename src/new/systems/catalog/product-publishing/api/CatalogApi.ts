import { HttpClient } from "../../../../core/api/HttpClient";
import { ICatalogRepository } from "../interface/ICatalogRepository";
import { CatalogProduct, PublishCatalogProductDto } from "../model/CatalogProduct";

type CatalogProductResponse = {
  Id: number;
  Business_Id: number;
  Name: string;
  Description: string;
  Published: boolean;
};

export class CatalogApi implements ICatalogRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async listPublishedProducts(businessId: number, token: string): Promise<CatalogProduct[]> {
    const response = await this.httpClient.request<CatalogProductResponse[]>({
      method: "GET",
      path: `catalog/business/${businessId}/products`,
      token,
      query: { published: true },
    });

    return response.map((item) => this.toDomain(item));
  }

  async publishProduct(payload: PublishCatalogProductDto, token: string): Promise<CatalogProduct> {
    const response = await this.httpClient.request<CatalogProductResponse>({
      method: "POST",
      path: "catalog/products",
      token,
      body: payload,
    });

    return this.toDomain(response).publish();
  }

  private toDomain(item: CatalogProductResponse): CatalogProduct {
    return new CatalogProduct(item.Id, item.Business_Id, item.Name, item.Description, item.Published);
  }
}
