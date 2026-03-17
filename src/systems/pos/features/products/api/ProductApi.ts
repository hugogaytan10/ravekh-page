import { HttpClient } from "../../../../shared/api/HttpClient";
import { fail, ok, type Result } from "../../../../shared/models/Result";
import type { ProductGateway } from "../interfaces/ProductContracts";
import type { Product } from "../models/Product";
import { ProductMapper } from "./ProductMapper";

export class ProductApi implements ProductGateway {
  constructor(private readonly httpClient: HttpClient) {}

  async getByBusinessId(token: string, businessId: string): Promise<Product[]> {
    const products = await this.httpClient.request<unknown[]>(`products/business/${businessId}`, {
      token,
    });

    return (Array.isArray(products) ? products : []).map((item) => ProductMapper.fromLegacy(item as never));
  }

  async getById(token: string, productId: number): Promise<Product | null> {
    const product = await this.httpClient.request<unknown>(`products/${productId}`, { token });

    if (!product || typeof product !== "object") {
      return null;
    }

    return ProductMapper.fromLegacy(product as never);
  }

  async create(token: string, product: Product): Promise<Result<Product>> {
    try {
      await this.httpClient.request("products", {
        method: "POST",
        token,
        body: { Product: ProductMapper.toLegacy(product), Variants: product.variants ?? null },
      });

      return ok(product, "Product created successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return fail("Failed to create product.", message);
    }
  }

  async update(token: string, product: Product): Promise<Result<Product>> {
    if (!product.id) {
      return fail("Failed to update product.", "Missing product id.");
    }

    try {
      await this.httpClient.request(`products/${product.id}`, {
        method: "PUT",
        token,
        body: ProductMapper.toLegacy(product),
      });

      return ok(product, "Product updated successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return fail("Failed to update product.", message);
    }
  }

  async archive(token: string, productId: number): Promise<Result<null>> {
    try {
      await this.httpClient.request(`products/available/${productId}`, {
        method: "PUT",
        token,
        body: { Available: false },
      });

      return ok(null, "Product archived successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return fail("Failed to archive product.", message);
    }
  }
}
