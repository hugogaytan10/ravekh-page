import { StorefrontBusiness, StorefrontProduct } from "../model/CatalogStorefrontModels";

type BusinessResponse = { Id?: number; Name?: string; PhoneNumber?: string | null };
type ProductResponse = {
  Id?: number;
  Business_Id?: number;
  Name?: string;
  Description?: string;
  Image?: string;
  Price?: number;
  PromotionPrice?: number;
  Stock?: number;
};

const normalizeBase = (value: string) => (value.endsWith("/") ? value : `${value}/`);

export class CatalogStorefrontApi {
  constructor(private readonly baseUrl: string) {}

  async getBusinessById(businessId: string): Promise<StorefrontBusiness | null> {
    const response = await fetch(`${normalizeBase(this.baseUrl)}business/${businessId}`);
    if (!response.ok) return null;
    const data = (await response.json()) as BusinessResponse;

    return {
      id: Number(data.Id ?? 0),
      name: data.Name?.trim() || "Tienda",
      phone: data.PhoneNumber ?? null,
    };
  }

  async getProductsByBusiness(businessId: string): Promise<StorefrontProduct[]> {
    const response = await fetch(`${normalizeBase(this.baseUrl)}products/showstore/stockgtzero/${businessId}/1?page=1`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Limit: "80" }),
    });

    if (!response.ok) return [];

    const raw = (await response.json()) as { products?: ProductResponse[] } | ProductResponse[];
    const items = Array.isArray(raw) ? raw : raw.products ?? [];

    return items
      .filter((item) => Number(item.Stock ?? 0) > 0)
      .map((item) => ({
        id: Number(item.Id ?? 0),
        businessId: Number(item.Business_Id ?? businessId),
        name: item.Name?.trim() || "Producto",
        description: item.Description?.trim() || "",
        image: item.Image || "",
        price: Number(item.Price ?? 0),
        promotionPrice: item.PromotionPrice != null ? Number(item.PromotionPrice) : null,
      }))
      .filter((item) => item.id > 0);
  }

  async getProductById(productId: string): Promise<StorefrontProduct | null> {
    const response = await fetch(`${normalizeBase(this.baseUrl)}products/${productId}`);
    if (!response.ok) return null;
    const item = (await response.json()) as ProductResponse | null;
    if (!item || !Number(item.Id)) return null;

    return {
      id: Number(item.Id ?? 0),
      businessId: Number(item.Business_Id ?? 0),
      name: item.Name?.trim() || "Producto",
      description: item.Description?.trim() || "",
      image: item.Image || "",
      price: Number(item.Price ?? 0),
      promotionPrice: item.PromotionPrice != null ? Number(item.PromotionPrice) : null,
    };
  }
}
