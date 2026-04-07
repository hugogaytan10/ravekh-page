import { ICatalogStorefrontRepository } from "../interface/ICatalogStorefrontRepository";
import { CatalogOrderPayload, StorefrontBusiness, StorefrontProduct } from "../model/CatalogStorefrontModels";

type BusinessResponse = { Id?: number; Name?: string; PhoneNumber?: string | null; Plan?: string | null; plan?: string | null };
type CategoryResponse = { Id?: number; id?: number; Name?: string; name?: string };
type ProductResponse = {
  Id?: number;
  id?: number;
  Business_Id?: number;
  businessId?: number;
  Name?: string;
  name?: string;
  Description?: string;
  description?: string;
  Image?: string;
  image?: string;
  Price?: number | string;
  price?: number | string;
  PromotionPrice?: number | string;
  promotionPrice?: number | string;
  Images?: unknown;
  images?: unknown;
  VariantsCount?: number | string;
  variantsCount?: number | string;
};

type ProductsPagination = {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type StorefrontCategory = {
  id: number;
  name: string;
};

export type StorefrontProductsPage = {
  products: StorefrontProduct[];
  pagination: ProductsPagination;
};

export type StorefrontVariant = {
  id: number;
  description: string;
  color?: string;
  price: number;
  promotionPrice: number | null;
  costPerItem: number | null;
  stock: number | null;
};

export type StorefrontProductExtra = {
  id: number;
  productId: number;
  description: string;
  type: string;
};

export type StorefrontProductExtras = {
  colors: StorefrontProductExtra[];
  sizes: StorefrontProductExtra[];
};

export type StorefrontBusinessCheckoutConfig = {
  stripeAccountId: string | null;
  chargesEnabled: boolean;
  currency: string;
};

export type StorefrontStripeConfig = {
  publishableKey: string | null;
};

export type StorefrontStripeSessionPayload = {
  line_items: Array<{
    price_data: {
      currency: string;
      product_data: { name: string };
      unit_amount: number;
    };
    quantity: number;
  }>;
  return_url: string;
  connectedAccountId: string;
  businessId: number;
  ui_mode?: string;
  customer_email?: string;
  metadata?: Record<string, string>;
};

const normalizeBase = (value: string) => (value.endsWith("/") ? value : `${value}/`);

const parseNumber = (value: unknown, fallback = 0) => {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
};

const visitTrackerByBusiness = new Set<string>();

const normalizeImage = (rawImage: unknown, rawImages: unknown) => {
  const images = normalizeImages(rawImage, rawImages);
  return images[0] ?? "";
};

const normalizeImages = (rawImage: unknown, rawImages: unknown) => {
  const asString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

  const candidates: string[] = [];
  const single = asString(rawImage);
  if (single) candidates.push(single);

  if (Array.isArray(rawImages)) {
    for (const item of rawImages) {
      const parsed = asString(item);
      if (parsed) candidates.push(parsed);
    }
  } else if (typeof rawImages === "string") {
    const value = rawImages.trim();
    if (value.startsWith("[")) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            const image = asString(item);
            if (image) candidates.push(image);
          }
        }
      } catch {
        if (value) candidates.push(value);
      }
    } else if (value) {
      candidates.push(value);
    }
  }

  return Array.from(new Set(candidates));
};

const normalizeProducts = (items: ProductResponse[], businessId: string) =>
  items
    .map((item) => ({
      id: parseNumber(item.Id ?? item.id),
      businessId: parseNumber(item.Business_Id ?? item.businessId ?? businessId),
      name: (item.Name ?? item.name ?? "Producto").toString().trim(),
      description: (item.Description ?? item.description ?? "").toString().trim(),
      image: normalizeImage(item.Image ?? item.image, item.Images ?? item.images),
      images: normalizeImages(item.Image ?? item.image, item.Images ?? item.images),
      price: parseNumber(item.Price ?? item.price),
      promotionPrice: item.PromotionPrice ?? item.promotionPrice ?? null,
      variantsCount: parseNumber(item.VariantsCount ?? item.variantsCount),
    }))
    .map((item) => ({
      ...item,
      promotionPrice: item.promotionPrice != null ? parseNumber(item.promotionPrice) : null,
    }))
    .filter((item) => item.id > 0);

const normalizeProductsPage = (
  raw: { data?: ProductResponse[]; products?: ProductResponse[]; pagination?: { currentPage?: number; totalPages?: number; hasNext?: boolean; hasPrev?: boolean } } | ProductResponse[],
  page: number,
  businessId: string,
): StorefrontProductsPage => {
  const items = Array.isArray(raw) ? raw : raw.data ?? raw.products ?? [];
  const paginationRaw = Array.isArray(raw) ? undefined : raw.pagination;

  return {
    products: normalizeProducts(items, businessId),
    pagination: {
      currentPage: parseNumber(paginationRaw?.currentPage, page),
      totalPages: Math.max(1, parseNumber(paginationRaw?.totalPages, 1)),
      hasNext: Boolean(paginationRaw?.hasNext),
      hasPrev: Boolean(paginationRaw?.hasPrev),
    },
  };
};

export class CatalogStorefrontApi implements ICatalogStorefrontRepository {
  constructor(private readonly baseUrl: string) {}

  async getBusinessById(businessId: string): Promise<StorefrontBusiness | null> {
    const response = await fetch(`${normalizeBase(this.baseUrl)}business/${businessId}`);
    if (!response.ok) return null;
    const data = (await response.json()) as BusinessResponse;

    return {
      id: Number(data.Id ?? 0),
      name: data.Name?.trim() || "Tienda",
      phone: data.PhoneNumber ?? null,
      plan: String(data.Plan ?? data.plan ?? "").trim() || null,
    };
  }

  async getCategoriesByBusiness(businessId: string): Promise<StorefrontCategory[]> {
    const response = await fetch(`${normalizeBase(this.baseUrl)}categories/business/${businessId}`);
    if (!response.ok) return [];
    const raw = (await response.json()) as CategoryResponse[];
    if (!Array.isArray(raw)) return [];

    return raw
      .map((item) => ({ id: parseNumber(item.Id ?? item.id), name: (item.Name ?? item.name ?? "").toString().trim() }))
      .filter((item) => item.id > 0 && item.name.length > 0);
  }

  async getProductsByBusinessPage(businessId: string, page = 1, planLimit?: string): Promise<StorefrontProductsPage> {
    const businessKey = String(businessId).trim();
    const visit = visitTrackerByBusiness.has(businessKey) ? 2 : 1;
    visitTrackerByBusiness.add(businessKey);

    const response = await fetch(`${normalizeBase(this.baseUrl)}products/showstore/stockgtzero/${businessId}/1?page=${page}&visit=${visit}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Limit: String(planLimit ?? "30") }),
    });

    if (!response.ok) {
      return {
        products: [],
        pagination: { currentPage: page, totalPages: 1, hasNext: false, hasPrev: page > 1 },
      };
    }

    const raw = (await response.json()) as
      | { data?: ProductResponse[]; products?: ProductResponse[]; pagination?: { currentPage?: number; totalPages?: number; hasNext?: boolean; hasPrev?: boolean } }
      | ProductResponse[];

    return normalizeProductsPage(raw, page, businessId);
  }

  async getProductsByCategoryPage(categoryId: number, page = 1, planLimit?: string): Promise<StorefrontProductsPage> {
    const response = await fetch(`${normalizeBase(this.baseUrl)}products/category/availablegtzero/${categoryId}?page=${page}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Limit: String(planLimit ?? "30") }),
    });

    if (!response.ok) {
      return {
        products: [],
        pagination: { currentPage: page, totalPages: 1, hasNext: false, hasPrev: page > 1 },
      };
    }

    const raw = (await response.json()) as
      | { data?: ProductResponse[]; products?: ProductResponse[]; pagination?: { currentPage?: number; totalPages?: number; hasNext?: boolean; hasPrev?: boolean } }
      | ProductResponse[];

    return normalizeProductsPage(raw, page, String(categoryId));
  }


  async getBusinessCheckoutConfig(businessId: string): Promise<StorefrontBusinessCheckoutConfig | null> {
    const response = await fetch(`${normalizeBase(this.baseUrl)}business/${businessId}`);
    if (!response.ok) return null;
    const data = (await response.json()) as { StripeAccountId?: string | null; ChargesEnabled?: number | string; MoneyTipe?: string | null };

    return {
      stripeAccountId: data.StripeAccountId ?? null,
      chargesEnabled: Number(data.ChargesEnabled ?? 0) === 1,
      currency: (data.MoneyTipe || "MXN").toUpperCase(),
    };
  }

  async getStripeConfig(): Promise<StorefrontStripeConfig | null> {
    const response = await fetch(`${normalizeBase(this.baseUrl)}configStripe`);
    if (!response.ok) return null;
    const data = (await response.json()) as { publishableKey?: string | null };
    return { publishableKey: data.publishableKey ?? null };
  }

  async createCheckoutSession(payload: StorefrontStripeSessionPayload): Promise<{ sessionId?: string; message?: string } | null> {
    const response = await fetch(`${normalizeBase(this.baseUrl)}createCheckoutSession`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) return null;
    return (await response.json()) as { sessionId?: string; message?: string } | null;
  }

  async createCatalogOrder(payload: CatalogOrderPayload): Promise<{ Id?: number; Message?: string } | null> {
    const response = await fetch(`${normalizeBase(this.baseUrl)}ordersCatalog`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) return null;
    return (await response.json()) as { Id?: number; Message?: string } | null;
  }

  async getVariantsByProductId(productId: number): Promise<StorefrontVariant[]> {
    const response = await fetch(`${normalizeBase(this.baseUrl)}variants/product/${productId}`);
    if (!response.ok) return [];
    const raw = (await response.json()) as Array<{ Id?: number; Description?: string; Color?: string; Price?: number | string; PromotionPrice?: number | string; CostPerItem?: number | string; Stock?: number | string }>;
    if (!Array.isArray(raw)) return [];

    return raw
      .map((item) => ({
        id: parseNumber(item.Id),
        description: (item.Description || "Variante").trim(),
        color: item.Color?.trim() || "",
        price: parseNumber(item.Price),
        promotionPrice: item.PromotionPrice != null ? parseNumber(item.PromotionPrice) : null,
        costPerItem: item.CostPerItem != null ? parseNumber(item.CostPerItem) : null,
        stock: item.Stock != null ? parseNumber(item.Stock) : null,
      }))
      .filter((item) => item.id > 0);
  }

  async getProductExtrasByProductId(productId: number): Promise<StorefrontProductExtras> {
    const empty: StorefrontProductExtras = { colors: [], sizes: [] };
    const response = await fetch(`${normalizeBase(this.baseUrl)}extras/product/${productId}`);
    if (!response.ok) return empty;
    const raw = (await response.json()) as Record<string, Array<{ Id?: number; Product_Id?: number; Description?: string; Type?: string }>>;
    if (!raw || typeof raw !== "object") return empty;

    const normalizeExtras = (values: Array<{ Id?: number; Product_Id?: number; Description?: string; Type?: string }> | undefined) =>
      (Array.isArray(values) ? values : [])
        .map((item) => ({
          id: parseNumber(item.Id),
          productId: parseNumber(item.Product_Id),
          description: (item.Description ?? "").trim(),
          type: (item.Type ?? "").trim().toUpperCase(),
        }))
        .filter((item) => item.id > 0 && item.description.length > 0);

    return {
      colors: normalizeExtras(raw.COLOR),
      sizes: normalizeExtras(raw.TALLA),
    };
  }

  async getProductById(productId: string): Promise<StorefrontProduct | null> {
    const response = await fetch(`${normalizeBase(this.baseUrl)}products/${productId}`);
    if (!response.ok) return null;
    const item = (await response.json()) as ProductResponse | null;
    if (!item || !parseNumber(item.Id ?? item.id)) return null;

    return {
      id: parseNumber(item.Id ?? item.id),
      businessId: parseNumber(item.Business_Id ?? item.businessId),
      name: (item.Name ?? item.name ?? "Producto").toString().trim(),
      description: (item.Description ?? item.description ?? "").toString().trim(),
      image: normalizeImage(item.Image ?? item.image, item.Images ?? item.images),
      images: normalizeImages(item.Image ?? item.image, item.Images ?? item.images),
      price: parseNumber(item.Price ?? item.price),
      promotionPrice:
        item.PromotionPrice != null || item.promotionPrice != null
          ? parseNumber(item.PromotionPrice ?? item.promotionPrice)
          : null,
      variantsCount: parseNumber(item.VariantsCount ?? item.variantsCount),
    };
  }
}
