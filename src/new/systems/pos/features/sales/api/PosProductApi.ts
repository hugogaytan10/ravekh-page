import { HttpClient } from "../../../../core/api/HttpClient";
import { IProductRepository } from "../interface/IProductRepository";
import { CreateProductDto, Product } from "../model/Product";

type ProductResponse = {
  Id: number;
  Business_Id: number;
  Name: string;
  Price: number;
  Stock: number;
};

export class PosProductApi implements IProductRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async listByBusiness(businessId: number, token: string): Promise<Product[]> {
    let [withoutStock, withStock] = await Promise.all([
      this.httpClient.request<ProductResponse[]>({
        method: "GET",
        path: `products/stocknull/${businessId}`,
        token,
      }),
      this.httpClient.request<ProductResponse[]>({
        method: "GET",
        path: `products/stockgtzero/${businessId}`,
        token,
      }),
    ]);
    //validar si es alguno nulo pasar un array vacio
    if (!withoutStock) withoutStock = [];
    if (!withStock) withStock = [];
    return [...withoutStock, ...withStock].map((item) => this.toDomain(item));
  }

  async create(payload: CreateProductDto, token: string): Promise<Product> {
    const created = await this.httpClient.request<ProductResponse>({
      method: "POST",
      path: "products",
      token,
      body: { Product: payload, Variants: null },
    });

    return this.toDomain(created);
  }

  private toDomain(item: ProductResponse): Product {
    return new Product(item.Id, item.Business_Id, item.Name, item.Price, item.Stock);
  }
}
