import { ICatalogStorefrontRepository } from "../interface/ICatalogStorefrontRepository";
import { CatalogOrderPayload, StorefrontBusiness, StorefrontProduct, StorefrontWholesalePrice } from "../model/CatalogStorefrontModels";

type BusinessFeaturesResponse = {
  Catalog?: number | string | null;
  catalog?: number | string | null;
};

type BusinessResponse = {
  Id?: number;
  Name?: string;
  PhoneNumber?: string | null;
  Plan?: string | null;
  plan?: string | null;
  Logo?: string | null;
  logo?: string | null;
  Features?: BusinessFeaturesResponse | null;
  features?: BusinessFeaturesResponse | null;
};
type CategoryResponse = { Id?: number; id?: number; Name?: string; name?: string };
type ProductResponse = {
  Id?: number;
  id?: number;
  Business_Id?: number;
  businessId?: number;
  Category_Id?: number | string | null;
  categoryId?: number | string | null;
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
  WholesalePrice?: number | string | null;
  wholesalePrice?: number | string | null;
  WholesaleMinQuantity?: number | string | null;
  wholesaleMinQuantity?: number | string | null;
  WholesalePrices?: unknown;
  wholesalePrices?: unknown;
  Images?: unknown;
  images?: unknown;
  VariantsCount?: number | string;
  variantsCount?: number | string;
  ForSale?: boolean | number | string | null;
  forSale?: boolean | number | string | null;
  Available?: boolean | number | string | null;
  available?: boolean | number | string | null;
  ShowInStore?: boolean | number | string | null;
  showInStore?: boolean | number | string | null;
  ShowPrice?: boolean | number | string | null;
  showPrice?: boolean | number | string | null;
  Showprice?: boolean | number | string | null;
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
  image: string;
  price: number;
  promotionPrice: number | null;
  wholesalePrice: number | null;
  wholesaleMinQuantity: number | null;
  wholesalePrices: StorefrontWholesalePrice[];
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

const asString = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const normalizeOptionalNumber = (value: unknown): number | null => {
  if (value == null) return null;
  const next = Number(value);
  return Number.isFinite(next) ? next : null;
};

type WholesalePriceResponse = {
  Id?: number | string;
  id?: number | string;
  Product_Id?: number | string | null;
  productId?: number | string | null;
  Variant_Id?: number | string | null;
  variantId?: number | string | null;
  Price?: number | string;
  price?: number | string;
  MinQuantity?: number | string;
  minQuantity?: number | string;
};

const normalizeWholesalePrices = (
  raw: unknown,
  legacyPrice?: unknown,
  legacyMinQuantity?: unknown,
): StorefrontWholesalePrice[] => {
  let source: WholesalePriceResponse[] = [];

  if (Array.isArray(raw)) {
    source = raw as WholesalePriceResponse[];
  } else if (typeof raw === "string" && raw.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) source = parsed as WholesalePriceResponse[];
    } catch {
      source = [];
    }
  }

  const byQuantity = new Map<number, StorefrontWholesalePrice>();
  for (const item of source) {
    const price = normalizeOptionalNumber(item.Price ?? item.price);
    const minQuantity = Math.floor(parseNumber(item.MinQuantity ?? item.minQuantity));
    if (price == null || price <= 0 || minQuantity < 2) continue;

    const id = parseNumber(item.Id ?? item.id);
    const productId = normalizeOptionalNumber(item.Product_Id ?? item.productId);
    const variantId = normalizeOptionalNumber(item.Variant_Id ?? item.variantId);
    byQuantity.set(minQuantity, {
      ...(id > 0 ? { id } : {}),
      ...(productId != null && productId > 0 ? { productId } : {}),
      ...(variantId != null && variantId > 0 ? { variantId } : {}),
      price,
      minQuantity,
    });
  }

  if (byQuantity.size === 0) {
    const price = normalizeOptionalNumber(legacyPrice);
    const minQuantity = Math.floor(parseNumber(legacyMinQuantity));
    if (price != null && price > 0 && minQuantity >= 2) {
      byQuantity.set(minQuantity, { price, minQuantity });
    }
  }

  return Array.from(byQuantity.values()).sort((a, b) => a.minQuantity - b.minQuantity);
};

const toBoolean = (value: unknown, fallback = true) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "1" || normalized === "true") return true;
    if (normalized === "0" || normalized === "false") return false;
  }
  return fallback;
};

const isCatalogDebugEnabled = () => {
  if (typeof window === "undefined") return false;
  try {
    const byStorage = window.localStorage.getItem("catalog-v2-debug") === "1";
    const byQuery = new URLSearchParams(window.location.search).get("catalogDebug") === "1";
    return byStorage || byQuery;
  } catch {
    return false;
  }
};

const logCatalogDebug = (scope: string, payload: Record<string, unknown>) => {
  if (!isCatalogDebugEnabled()) return;
  console.info(`[catalog-v2][${scope}]`, payload);
};

const VISIT_COOKIE_PREFIX = "catalog-v2-visit";
const VISIT_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const getVisitCookieName = (businessId: string) => `${VISIT_COOKIE_PREFIX}-${String(businessId).trim()}`;

const readCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escapedName}=([^;]*)`));
  if (!match) return null;
  return decodeURIComponent(match[1] ?? "");
};

const writeCookie = (name: string, value: string, maxAgeSeconds: number) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
};

const getVisitValue = (businessId: string): 1 | 2 => {
  const cookieName = getVisitCookieName(businessId);
  return readCookie(cookieName) === "1" ? 2 : 1;
};

const normalizeImage = (rawImage: unknown, rawImages: unknown) => {
  const images = normalizeImages(rawImage, rawImages);
  return images[0] ?? "";
};

const normalizeImages = (rawImage: unknown, rawImages: unknown) => {
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
      categoryId: item.Category_Id != null || item.categoryId != null ? parseNumber(item.Category_Id ?? item.categoryId) : null,
      name: (item.Name ?? item.name ?? "Producto").toString().trim(),
      description: (item.Description ?? item.description ?? "").toString().trim(),
      image: normalizeImage(item.Image ?? item.image, item.Images ?? item.images),
      images: normalizeImages(item.Image ?? item.image, item.Images ?? item.images),
      price: parseNumber(item.Price ?? item.price),
      promotionPrice: item.PromotionPrice ?? item.promotionPrice ?? null,
      wholesalePrice: item.WholesalePrice ?? item.wholesalePrice ?? null,
      wholesaleMinQuantity: item.WholesaleMinQuantity ?? item.wholesaleMinQuantity ?? null,
      wholesalePrices: normalizeWholesalePrices(
        item.WholesalePrices ?? item.wholesalePrices,
        item.WholesalePrice ?? item.wholesalePrice,
        item.WholesaleMinQuantity ?? item.wholesaleMinQuantity,
      ),
      variantsCount: parseNumber(item.VariantsCount ?? item.variantsCount),
      forSale: toBoolean(item.ForSale ?? item.forSale, true),
      available: toBoolean(item.Available ?? item.available, true),
      showInStore: toBoolean(item.ShowInStore ?? item.showInStore, true),
      showPrice: toBoolean(item.ShowPrice ?? item.Showprice ?? item.showPrice, true),
    }))
    .map((item) => ({
      ...item,
      promotionPrice: item.promotionPrice != null ? parseNumber(item.promotionPrice) : null,
      wholesalePrice: item.wholesalePrice != null ? parseNumber(item.wholesalePrice) : null,
      wholesaleMinQuantity: item.wholesaleMinQuantity != null ? parseNumber(item.wholesaleMinQuantity) : null,
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

export const CATALOG_VISIT_LIMIT_REACHED_CODE = "CATALOG_VISIT_LIMIT_REACHED";

export class CatalogVisitLimitReachedError extends Error {
  code = CATALOG_VISIT_LIMIT_REACHED_CODE;

  constructor(message = "Este catálogo no esta disponible, por favor contacta al dueño del negocio") {
    super(message);
    this.name = "CatalogVisitLimitReachedError";
  }
}

type PublicCatalogBranch = {
  id?: number;
  name?: string;
  code?: string;
  slug?: string;
  isMain?: boolean;
  phoneNumber?: string | null;
  whatsApp?: string | null;
  address?: string | null;
  references?: string | null;
};

type PublicCatalogProduct = {
  id?: number;
  barcode?: string | null;
  name?: string;
  description?: string | null;
  category?: { id?: number; name?: string } | null;
  price?: number | string | null;
  promotionPrice?: number | string | null;
  effectivePrice?: number | string | null;
  showPrice?: boolean;
  stock?: number | string | null;
  inStock?: boolean;
  images?: Array<{ id?: number; image?: string; isPrimary?: boolean }>;
  variants?: Array<{
    id?: number;
    barcode?: string | null;
    description?: string;
    color?: string | null;
    image?: string | null;
    price?: number | string | null;
    promotionPrice?: number | string | null;
    effectivePrice?: number | string | null;
    stock?: number | string | null;
    inStock?: boolean;
    wholesalePrices?: WholesalePriceResponse[];
  }>;
  wholesalePrices?: WholesalePriceResponse[];
};

type PublicCatalogSnapshot = {
  business?: {
    id?: number;
    name?: string;
    logo?: string | null;
    color?: string | null;
    MoneyTipe?: string | null;
  };
  branch?: PublicCatalogBranch;
  availableBranches?: PublicCatalogBranch[];
  categories?: Array<{ id?: number; name?: string; products?: number }>;
  products?: PublicCatalogProduct[];
  shippingOptions?: unknown;
  socialNetworks?: unknown;
  meta?: Record<string, unknown>;
};

type PublicCatalogEnvelope = {
  success?: boolean;
  data?: PublicCatalogSnapshot;
};

const PUBLIC_CATALOG_PAGE_SIZE = 24;

export class CatalogStorefrontApi implements ICatalogStorefrontRepository {
  private readonly branchSlug: string | null;
  private lastBusinessId: string | null;
  private snapshotPromise: Promise<PublicCatalogSnapshot | null> | null = null;
  private snapshotKey: string | null = null;

  constructor(
    private readonly baseUrl: string,
    branchSlug?: string | null,
    businessIdHint?: string | number | null,
  ) {
    const normalizedSlug = String(branchSlug ?? "").trim();
    this.branchSlug = normalizedSlug || null;
    const normalizedBusinessId = String(businessIdHint ?? "").trim();
    this.lastBusinessId = normalizedBusinessId || null;
  }

  private getPublicCatalogUrl(businessId: string) {
    const base = `${normalizeBase(this.baseUrl)}public-catalog/${encodeURIComponent(businessId)}`;
    return this.branchSlug ? `${base}/${encodeURIComponent(this.branchSlug)}` : base;
  }

  private async getPublicSnapshot(businessId: string): Promise<PublicCatalogSnapshot | null> {
    const normalizedBusinessId = String(businessId ?? "").trim();
    if (!normalizedBusinessId) return null;
    this.lastBusinessId = normalizedBusinessId;

    const key = `${normalizedBusinessId}:${this.branchSlug ?? "main"}`;
    if (this.snapshotPromise && this.snapshotKey === key) return this.snapshotPromise;

    this.snapshotKey = key;
    this.snapshotPromise = (async () => {
      const response = await fetch(this.getPublicCatalogUrl(normalizedBusinessId));
      if (!response.ok) return null;
      const envelope = (await response.json()) as PublicCatalogEnvelope | PublicCatalogSnapshot;
      const snapshot = (envelope as PublicCatalogEnvelope).data ?? (envelope as PublicCatalogSnapshot);
      return snapshot && typeof snapshot === "object" ? snapshot : null;
    })();

    return this.snapshotPromise;
  }

  private normalizePublicProduct(item: PublicCatalogProduct, businessId: string): StorefrontProduct {
    const imageRows = Array.isArray(item.images) ? item.images : [];
    const images = imageRows
      .map((image) => asString(image?.image))
      .filter(Boolean);

    return {
      id: parseNumber(item.id),
      businessId: parseNumber(businessId),
      categoryId: item.category?.id != null ? parseNumber(item.category.id) : null,
      name: asString(item.name) || "Producto",
      description: asString(item.description),
      image: images[0] ?? "",
      images,
      price: parseNumber(item.price),
      promotionPrice: normalizeOptionalNumber(item.promotionPrice),
      wholesalePrice: null,
      wholesaleMinQuantity: null,
      wholesalePrices: normalizeWholesalePrices(item.wholesalePrices),
      variantsCount: Array.isArray(item.variants) ? item.variants.length : 0,
      forSale: true,
      available: true,
      showInStore: true,
      showPrice: item.showPrice !== false,
    };
  }

  private normalizePublicVariant(item: NonNullable<PublicCatalogProduct["variants"]>[number]): StorefrontVariant {
    const tiers = normalizeWholesalePrices(item.wholesalePrices);
    return {
      id: parseNumber(item.id),
      description: asString(item.description) || "Variante",
      color: asString(item.color),
      image: asString(item.image),
      price: parseNumber(item.price),
      promotionPrice: normalizeOptionalNumber(item.promotionPrice),
      wholesalePrice: tiers[0]?.price ?? null,
      wholesaleMinQuantity: tiers[0]?.minQuantity ?? null,
      wholesalePrices: tiers,
      costPerItem: null,
      stock: normalizeOptionalNumber(item.stock),
    };
  }

  private async getPublicProducts(businessId: string): Promise<StorefrontProduct[]> {
    const snapshot = await this.getPublicSnapshot(businessId);
    const rows = Array.isArray(snapshot?.products) ? snapshot.products : [];
    return rows
      .map((item) => this.normalizePublicProduct(item, businessId))
      .filter((item) => item.id > 0);
  }

  async getBusinessById(businessId: string): Promise<StorefrontBusiness | null> {
    logCatalogDebug("business:request", { businessId, branchSlug: this.branchSlug });

    const [snapshot, legacyResponse] = await Promise.all([
      this.getPublicSnapshot(businessId),
      fetch(`${normalizeBase(this.baseUrl)}business/${businessId}`).catch(() => null),
    ]);

    if (!snapshot?.business) return null;

    let legacy: BusinessResponse | null = null;
    if (legacyResponse?.ok) {
      legacy = (await legacyResponse.json().catch(() => null)) as BusinessResponse | null;
    }

    const catalogFeature = normalizeOptionalNumber(legacy?.Features?.Catalog ?? legacy?.features?.Catalog ?? legacy?.features?.catalog);
    const branch = snapshot.branch;
    const availableBranches = Array.isArray(snapshot.availableBranches) ? snapshot.availableBranches : [];

    return {
      id: parseNumber(snapshot.business.id ?? businessId),
      name: asString(snapshot.business.name) || asString(legacy?.Name) || "Tienda",
      phone: asString(branch?.whatsApp) || asString(branch?.phoneNumber) || asString(legacy?.PhoneNumber) || null,
      plan: asString(legacy?.Plan ?? legacy?.plan) || null,
      logo: asString(snapshot.business.logo) || asString(legacy?.Logo ?? legacy?.logo) || null,
      catalogFeature,
      branch: branch
        ? {
            id: parseNumber(branch.id),
            name: asString(branch.name) || "Sucursal",
            code: asString(branch.code),
            slug: asString(branch.slug),
            isMain: Boolean(branch.isMain),
            phoneNumber: asString(branch.phoneNumber) || null,
            whatsApp: asString(branch.whatsApp) || null,
            address: asString(branch.address) || null,
            references: asString(branch.references) || null,
          }
        : undefined,
      availableBranches: availableBranches
        .map((row) => ({
          id: parseNumber(row.id),
          name: asString(row.name) || "Sucursal",
          code: asString(row.code),
          slug: asString(row.slug),
          isMain: Boolean(row.isMain),
        }))
        .filter((row) => row.id > 0 && row.slug.length > 0),
    };
  }

  async getCategoriesByBusiness(businessId: string): Promise<StorefrontCategory[]> {
    const snapshot = await this.getPublicSnapshot(businessId);
    const rows = Array.isArray(snapshot?.categories) ? snapshot.categories : [];
    return rows
      .map((row) => ({ id: parseNumber(row.id), name: asString(row.name) }))
      .filter((row) => row.id > 0 && row.name.length > 0);
  }

  async getProductsByBusinessPage(businessId: string, page = 1, _planLimit?: string): Promise<StorefrontProductsPage> {
    const all = await this.getPublicProducts(businessId);
    const safePage = Math.max(1, Math.floor(Number(page) || 1));
    const totalPages = Math.max(1, Math.ceil(all.length / PUBLIC_CATALOG_PAGE_SIZE));
    const currentPage = Math.min(safePage, totalPages);
    const start = (currentPage - 1) * PUBLIC_CATALOG_PAGE_SIZE;
    return {
      products: all.slice(start, start + PUBLIC_CATALOG_PAGE_SIZE),
      pagination: {
        currentPage,
        totalPages,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1,
      },
    };
  }

  async getProductsByCategoryPage(categoryId: number, page = 1, _planLimit?: string): Promise<StorefrontProductsPage> {
    const businessId = this.lastBusinessId ?? "";
    if (!businessId) return { products: [], pagination: { currentPage: 1, totalPages: 1, hasNext: false, hasPrev: false } };
    const all = (await this.getPublicProducts(businessId)).filter((product) => product.categoryId === categoryId);
    const safePage = Math.max(1, Math.floor(Number(page) || 1));
    const totalPages = Math.max(1, Math.ceil(all.length / PUBLIC_CATALOG_PAGE_SIZE));
    const currentPage = Math.min(safePage, totalPages);
    const start = (currentPage - 1) * PUBLIC_CATALOG_PAGE_SIZE;
    return {
      products: all.slice(start, start + PUBLIC_CATALOG_PAGE_SIZE),
      pagination: { currentPage, totalPages, hasNext: currentPage < totalPages, hasPrev: currentPage > 1 },
    };
  }

  async getAllProductsByBusiness(businessId: string, _planLimit?: string): Promise<StorefrontProduct[]> {
    return this.getPublicProducts(businessId);
  }

  async getAllProductsByCategory(categoryId: number, businessId: string, _planLimit?: string): Promise<StorefrontProduct[]> {
    return (await this.getPublicProducts(businessId)).filter((product) => product.categoryId === categoryId);
  }

  async registerBusinessVisit(businessId: string, mode: "unique" | "always" = "unique"): Promise<boolean> {
    const normalizedBusinessId = parseNumber(businessId);
    if (normalizedBusinessId <= 0) return false;

    if (mode === "unique") {
      const cookieName = getVisitCookieName(normalizedBusinessId.toString());
      if (readCookie(cookieName) === "1") return false;
      writeCookie(cookieName, "1", VISIT_COOKIE_MAX_AGE_SECONDS);
    }

    try {
      const response = await fetch(`${normalizeBase(this.baseUrl)}logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Business_Id: normalizedBusinessId }),
      });
      const payload = await response.json().catch(() => null) as { message?: string; code?: string } | null;
      if (response.status === 403 && payload?.code === CATALOG_VISIT_LIMIT_REACHED_CODE) {
        throw new CatalogVisitLimitReachedError(payload.message);
      }
      return response.ok;
    } catch (cause) {
      if (cause instanceof CatalogVisitLimitReachedError) throw cause;
      return false;
    }
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
    const businessId = this.lastBusinessId ?? "";
    if (businessId) {
      const snapshot = await this.getPublicSnapshot(businessId);
      const product = (snapshot?.products ?? []).find((item) => parseNumber(item.id) === productId);
      if (product) {
        return (product.variants ?? [])
          .map((variant) => this.normalizePublicVariant(variant))
          .filter((variant) => variant.id > 0);
      }
    }

    // Compatibilidad para vistas antiguas que abran un detalle sin contexto de catálogo.
    const response = await fetch(`${normalizeBase(this.baseUrl)}variants/product/${productId}`);
    if (!response.ok) return [];
    const raw = (await response.json()) as Array<{ Id?: number; id?: number; Description?: string; description?: string; Color?: string; color?: string; Image?: string; image?: string; Price?: number | string; price?: number | string; PromotionPrice?: number | string; promotionPrice?: number | string; WholesalePrice?: number | string | null; wholesalePrice?: number | string | null; WholesaleMinQuantity?: number | string | null; wholesaleMinQuantity?: number | string | null; WholesalePrices?: unknown; wholesalePrices?: unknown; CostPerItem?: number | string; costPerItem?: number | string; Stock?: number | string; stock?: number | string }>;
    if (!Array.isArray(raw)) return [];
    return raw.map((item) => ({
      id: parseNumber(item.Id ?? item.id),
      description: asString(item.Description ?? item.description) || "Variante",
      color: asString(item.Color ?? item.color),
      image: asString(item.Image ?? item.image),
      price: parseNumber(item.Price ?? item.price),
      promotionPrice: normalizeOptionalNumber(item.PromotionPrice ?? item.promotionPrice),
      wholesalePrice: normalizeOptionalNumber(item.WholesalePrice ?? item.wholesalePrice),
      wholesaleMinQuantity: normalizeOptionalNumber(item.WholesaleMinQuantity ?? item.wholesaleMinQuantity),
      wholesalePrices: normalizeWholesalePrices(item.WholesalePrices ?? item.wholesalePrices, item.WholesalePrice ?? item.wholesalePrice, item.WholesaleMinQuantity ?? item.wholesaleMinQuantity),
      costPerItem: normalizeOptionalNumber(item.CostPerItem ?? item.costPerItem),
      stock: normalizeOptionalNumber(item.Stock ?? item.stock),
    })).filter((item) => item.id > 0);
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
          description: asString(item.Description),
          type: asString(item.Type).toUpperCase(),
        }))
        .filter((item) => item.id > 0 && item.description.length > 0);
    return { colors: normalizeExtras(raw.COLOR), sizes: normalizeExtras(raw.TALLA) };
  }

  async getProductById(productId: string): Promise<StorefrontProduct | null> {
    const businessId = this.lastBusinessId ?? "";
    if (businessId) {
      const products = await this.getPublicProducts(businessId);
      const found = products.find((product) => product.id === parseNumber(productId));
      if (found) return found;
    }

    const response = await fetch(`${normalizeBase(this.baseUrl)}products/${productId}`);
    if (!response.ok) return null;
    const item = (await response.json()) as ProductResponse | null;
    if (!item || !parseNumber(item.Id ?? item.id)) return null;
    return normalizeProducts([item], String(item.Business_Id ?? item.businessId ?? businessId))[0] ?? null;
  }
}
