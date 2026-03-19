import { HttpClient } from "../../../../core/api/HttpClient";
import { IProductRepository, ProductCategory } from "../interface/IProductRepository";
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

  async listCategoriesByBusiness(businessId: number, token: string): Promise<ProductCategory[]> {
    const categories = await this.httpClient.request<CategoryResponse[] | null>({
      method: "GET",
      path: `categories/business/${businessId}`,
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
      path: "products",
      token,
      body: { Product: payload, Variants: null },
    });

    return this.toDomain(created);
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
