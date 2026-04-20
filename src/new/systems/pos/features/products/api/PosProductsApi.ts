import { HttpClient } from "../../../../core/api/HttpClient";
import { POS_ENDPOINTS } from "../../../shared/api/posEndpoints";
import { toPaginationMeta } from "../../../shared/model/Pagination";
import { IProductsRepository, ProductsPaginatedResult } from "../interface/IProductsRepository";
import { ManagedProduct, ProductCategory, ProductExtra, ProductVariant, SaveManagedProductDto } from "../model/ManagedProduct";

type ProductResponse = {
  Id?: number;
  id?: number;
  Business_Id?: number;
  business_Id?: number;
  businessId?: number;
  Category_Id?: number | null;
  category_Id?: number | null;
  categoryId?: number | null;
  Category_Name?: string | null;
  category_Name?: string | null;
  categoryName?: string | null;
  Name?: string;
  name?: string;
  Description?: string;
  description?: string;
  Color?: string | null;
  color?: string | null;
  ForSale?: boolean;
  forSale?: boolean;
  ShowInStore?: boolean;
  showInStore?: boolean;
  Available?: boolean | number | string | null;
  available?: boolean | number | string | null;
  Volume?: boolean;
  volume?: boolean;
  Image?: string;
  image?: string;
  Images?: string[];
  images?: string[];
  Barcode?: string | null;
  barcode?: string | null;
  Price?: number | null;
  price?: number | null;
  PromotionPrice?: number | null;
  promotionPrice?: number | null;
  CostPerItem?: number | null;
  costPerItem?: number | null;
  Stock?: number | null;
  stock?: number | null;
  ExpDate?: string | null;
  expDate?: string | null;
  MinStock?: number | null;
  minStock?: number | null;
  OptStock?: number | null;
  optStock?: number | null;
  Quantity?: number | null;
  quantity?: number | null;
  Variants?: LegacyVariantResponse[];
  variants?: LegacyVariantResponse[];
  VariantsCount?: number | string | null;
  variantsCount?: number | string | null;
};

type LegacyVariantResponse = {
  Id?: number;
  id?: number;
  Product_Id?: number;
  product_Id?: number;
  Description?: string;
  description?: string;
  Barcode?: string | null;
  barcode?: string | null;
  Color?: string | null;
  color?: string | null;
  Size?: string | null;
  size?: string | null;
  Talla?: string | null;
  talla?: string | null;
  Price?: number | null;
  price?: number | null;
  PromotionPrice?: number | null;
  promotionPrice?: number | null;
  CostPerItem?: number | null;
  costPerItem?: number | null;
  Stock?: number | null;
  stock?: number | null;
  ExpDate?: string | null;
  expDate?: string | null;
  MinStock?: number | null;
  minStock?: number | null;
  OptStock?: number | null;
  optStock?: number | null;
};

type ExtraResponse = {
  Id?: number;
  id?: number;
  Product_Id?: number;
  product_Id?: number;
  ProductId?: number;
  productId?: number;
  Description?: string;
  description?: string;
  Type?: string;
  type?: string;
};

type CategoryResponse = {
  Id?: number;
  id?: number;
  Business_Id?: number;
  business_Id?: number;
  Parent_Id?: number | null;
  parent_Id?: number | null;
  Name?: string;
  name?: string;
  Color?: string;
  color?: string;
};

export class PosProductsApi implements IProductsRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async listByBusiness(businessId: number, token: string): Promise<ManagedProduct[]> {
    const products = await this.httpClient.request<ProductResponse[] | { data?: ProductResponse[]; Data?: ProductResponse[]; Products?: ProductResponse[] }>({
      method: "GET",
      path: POS_ENDPOINTS.productsByBusiness(businessId),
      token,
    });

    const rows = Array.isArray(products)
      ? products
      : products?.data ?? products?.Data ?? products?.Products ?? [];

    return rows.map((product) => this.toDomain(product));
  }

  async listByBusinessPaginated(businessId: number, token: string, page: number, limit: string | number): Promise<ProductsPaginatedResult> {
    const payload = await this.httpClient.request<
      ProductResponse[] |
      { products?: ProductResponse[]; data?: ProductResponse[]; pagination?: Record<string, unknown> }
    >({
      method: "GET",
      path: POS_ENDPOINTS.productsByBusiness(businessId),
      token,
      query: { page, limit },
    });

    const rows = Array.isArray(payload)
      ? payload
      : payload?.products ?? payload?.data ?? [];

    const paginationPayload = Array.isArray(payload) ? undefined : payload?.pagination;
    const categoryIds = Array.isArray(paginationPayload?.categoryIds)
      ? paginationPayload.categoryIds.map((id) => Number(id)).filter((id) => Number.isFinite(id))
      : [];

    return {
      products: rows.map((product) => this.toDomain(product)),
      pagination: {
        ...toPaginationMeta(paginationPayload, page, Number(limit) || 20, rows.length),
        categoryIds,
      },
    };
  }

  async getById(productId: number, token: string): Promise<ManagedProduct | null> {
    const [product, extrasResponse, variantsResponse] = await Promise.all([
      this.httpClient.request<ProductResponse | { data?: ProductResponse; Data?: ProductResponse } | null>({
        method: "GET",
        path: POS_ENDPOINTS.productById(productId),
        token,
      }),
      this.httpClient.request<unknown>({
        method: "GET",
        path: POS_ENDPOINTS.productExtras(productId),
        token,
      }).catch(() => null),
      this.httpClient.request<LegacyVariantResponse[] | { data?: LegacyVariantResponse[]; Data?: LegacyVariantResponse[] } | null>({
        method: "GET",
        path: POS_ENDPOINTS.variantsByProduct(productId),
        token,
      }).catch(() => null),
    ]);

    if (!product) {
      return null;
    }

    const normalized = "data" in product || "Data" in product ? product.data ?? product.Data ?? null : product;
    if (!normalized) return null;

    return this.toDomain(normalized, this.toDomainExtras(extrasResponse), this.toDomainVariants(this.normalizeVariantsPayload(variantsResponse)));
  }

  async create(payload: SaveManagedProductDto, token: string): Promise<ManagedProduct> {
    let response: ProductResponse | { Product?: ProductResponse; product?: ProductResponse; Id?: number; id?: number; insertId?: number } | null;
    let createdProductId: number | null = null;
    let variantsSyncedViaCreatePayload = false;
    try {
      response = await this.httpClient.request<ProductResponse | { Product?: ProductResponse; product?: ProductResponse; Id?: number; id?: number; insertId?: number } | null>({
        method: "POST",
        path: POS_ENDPOINTS.products(),
        token,
        body: this.toMutationBody(payload, true, true),
      });
      variantsSyncedViaCreatePayload = true;
    } catch (cause) {
      if (!payload.extras?.length) throw cause;
      response = await this.httpClient.request<ProductResponse | { Product?: ProductResponse; product?: ProductResponse; Id?: number; id?: number; insertId?: number } | null>({
        method: "POST",
        path: POS_ENDPOINTS.products(),
        token,
        body: this.toMutationBody(payload, false, true),
      });
      variantsSyncedViaCreatePayload = true;
      const created = this.extractCreatedProduct(response);
      const productId = created?.Id ?? created?.id;
      if (productId) {
        createdProductId = Number(productId);
        await this.persistExtras(productId, payload.extras, token);
      }
    }

    const created = this.extractCreatedProduct(response);
    const fallbackInsertId = response && typeof response === "object" && "insertId" in response
      ? Number((response as { insertId?: number }).insertId ?? 0)
      : 0;
    createdProductId = createdProductId ?? (Number(created?.Id ?? created?.id ?? 0) || (Number.isFinite(fallbackInsertId) && fallbackInsertId > 0 ? fallbackInsertId : null));

    if (!variantsSyncedViaCreatePayload && createdProductId && (payload.variants?.length ?? 0) > 0) {
      await this.syncVariants(createdProductId, payload.variants ?? [], token);
    }

    if (created) {
      return this.toDomain(created, this.extractCreatedExtras(response));
    }

    return new ManagedProduct(
      payload.id ?? 0,
      payload.businessId,
      payload.name,
      payload.description,
      payload.color ?? null,
      payload.forSale,
      payload.showInStore,
      payload.available,
      payload.volume ?? false,
      payload.categoryId ?? null,
      null,
      payload.price ?? null,
      payload.promotionPrice ?? null,
      payload.costPerItem ?? null,
      payload.stock ?? null,
      payload.expDate ?? null,
      payload.minStock ?? null,
      payload.optStock ?? null,
      payload.quantity ?? null,
      payload.image ?? null,
      payload.images ?? [],
      payload.barcode ?? null,
      payload.variants ?? [],
      payload.extras ?? [],
      payload.variants?.length ?? 0,
    );
  }

  async update(payload: SaveManagedProductDto, token: string): Promise<ManagedProduct> {
    if (!payload.id) {
      throw new Error("Product id is required for updates.");
    }

    const updated = await this.httpClient.request<ProductResponse | null>({
      method: "PUT",
      path: POS_ENDPOINTS.productById(payload.id),
      token,
      body: this.toLegacy(payload),
    });

    await Promise.all([
      this.syncVariants(payload.id, payload.variants ?? [], token),
      this.syncExtras(payload.id, payload.extras ?? [], token),
    ]);

    if (!updated) {
      return this.toDomain(this.toLegacy(payload), payload.extras ?? []);
    }

    return this.toDomain(updated, payload.extras ?? []);
  }

  private toAvailabilityFlag(value: ProductResponse["Available"]): boolean {
    if (value === null || value === false || value === 0 || value === "0") return false;
    if (value === true || value === 1 || value === "1") return true;
    return value === undefined ? true : Boolean(value);
  }

  async archive(productId: number, token: string): Promise<void> {
    await this.httpClient.request<void>({
      method: "PUT",
      path: POS_ENDPOINTS.productAvailability(productId),
      token,
      body: { Available: false },
    });
  }

  async listCategoriesByBusiness(businessId: number, token: string): Promise<ProductCategory[]> {
    const payload = await this.httpClient.request<CategoryResponse[] | { data?: CategoryResponse[]; Data?: CategoryResponse[] } | null>({
      method: "GET",
      path: POS_ENDPOINTS.categoriesByBusiness(businessId),
      token,
    });

    const rows = Array.isArray(payload)
      ? payload
      : payload?.data ?? payload?.Data ?? [];

    return rows.map((category) => this.toDomainCategory(category));
  }

  async createCategory(category: ProductCategory, token: string): Promise<ProductCategory> {
    const response = await this.httpClient.request<CategoryResponse | null>({
      method: "POST",
      path: POS_ENDPOINTS.categories(),
      token,
      body: this.toLegacyCategory(category),
    });

    return response ? this.toDomainCategory(response) : category;
  }

  async updateCategory(category: ProductCategory, token: string): Promise<ProductCategory> {
    if (!category.id) {
      throw new Error("Category id is required for updates.");
    }

    const response = await this.httpClient.request<CategoryResponse | null>({
      method: "PUT",
      path: POS_ENDPOINTS.categoryById(category.id),
      token,
      body: this.toLegacyCategory(category),
    });

    return response ? this.toDomainCategory(response) : category;
  }

  async deleteCategory(categoryId: number, token: string): Promise<void> {
    await this.httpClient.request<void>({
      method: "DELETE",
      path: POS_ENDPOINTS.categoryById(categoryId),
      token,
      body: { Available: false },
    });
  }

  async importProducts(businessId: number, file: File, token: string): Promise<{ imported: number; message: string; errors?: string[] }> {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension !== "csv") {
      throw new Error("Por ahora la importación soporta archivos CSV. Guarda tu Excel como .csv e inténtalo de nuevo.");
    }

    const csvText = await file.text();
    const rows = this.parseCsvRows(csvText);
    if (rows.length === 0) {
      throw new Error("El archivo no contiene registros válidos para importar.");
    }

    await this.ensureImportCategories(businessId, rows, token);

    const response = await this.httpClient.request<{ imported?: number; message?: string; total?: number; created?: number; updated?: number; errors?: string[] }>({
      method: "POST",
      path: POS_ENDPOINTS.productImport(businessId),
      token,
      body: { rows },
    });

    const imported = Number(response?.imported ?? response?.total ?? 0);
    const created = Number(response?.created ?? 0);
    const updated = Number(response?.updated ?? 0);

    return {
      imported: Number.isFinite(imported) && imported > 0 ? imported : Math.max(created + updated, 0),
      message: response?.message ?? "Importación completada.",
      errors: Array.isArray(response?.errors) ? response.errors : [],
    };
  }

  private parseCsvRows(csvText: string): Record<string, string>[] {
    const normalized = csvText.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
    if (!normalized) return [];

    const lines = this.parseCsvLineArray(normalized);
    if (lines.length < 2) return [];

    const headers = lines[0].map((header) => String(header ?? "").trim());
    const rows: Record<string, string>[] = [];

    for (let index = 1; index < lines.length; index += 1) {
      const values = lines[index];
      const row: Record<string, string> = {};
      let hasContent = false;

      headers.forEach((header, headerIndex) => {
        if (!header) return;
        const value = String(values[headerIndex] ?? "").trim();
        row[header] = value;
        if (value.length > 0) hasContent = true;
      });

      if (hasContent) {
        rows.push(row);
      }
    }

    return rows;
  }

  private async ensureImportCategories(businessId: number, rows: Record<string, string>[], token: string): Promise<void> {
    const existingCategories = await this.listCategoriesByBusiness(businessId, token);
    const byParentAndName = new Map<string, ProductCategory>();

    existingCategories.forEach((category) => {
      if (!category.id) return;
      byParentAndName.set(this.buildCategoryKey(category.name, category.parentId ?? null), category);
    });

    for (const row of rows) {
      const parentName = this.normalizeImportCell(row.Category);
      if (!parentName) continue;

      const parentColor = this.normalizeImportCell(row.CategoryColor) || "#6D01D1";
      let parentCategory = byParentAndName.get(this.buildCategoryKey(parentName, null));

      if (!parentCategory) {
        parentCategory = await this.createCategory(
          {
            businessId,
            parentId: null,
            name: parentName,
            color: parentColor,
          },
          token,
        );
        byParentAndName.set(this.buildCategoryKey(parentName, null), parentCategory);
      }

      const subcategoryName = this.normalizeImportCell(row.Subcategory);
      if (!subcategoryName || !parentCategory.id) continue;

      const subcategoryColor = this.normalizeImportCell(row.SubcategoryColor) || parentCategory.color || "#6D01D1";
      const subcategoryKey = this.buildCategoryKey(subcategoryName, parentCategory.id);
      if (byParentAndName.has(subcategoryKey)) continue;

      const createdSubcategory = await this.createCategory(
        {
          businessId,
          parentId: parentCategory.id,
          name: subcategoryName,
          color: subcategoryColor,
        },
        token,
      );

      byParentAndName.set(subcategoryKey, createdSubcategory);
    }
  }

  private buildCategoryKey(name: string, parentId: number | null): string {
    return `${(parentId ?? 0).toString()}::${name.trim().toLowerCase()}`;
  }

  private normalizeImportCell(value: unknown): string {
    if (typeof value !== "string") return "";
    return value.trim();
  }

  private parseCsvLineArray(input: string): string[][] {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = "";
    let inQuotes = false;

    for (let index = 0; index < input.length; index += 1) {
      const char = input[index];
      const nextChar = input[index + 1];

      if (char === "\"") {
        if (inQuotes && nextChar === "\"") {
          currentCell += "\"";
          index += 1;
          continue;
        }
        inQuotes = !inQuotes;
        continue;
      }

      if (!inQuotes && char === ",") {
        currentRow.push(currentCell);
        currentCell = "";
        continue;
      }

      if (!inQuotes && char === "\n") {
        currentRow.push(currentCell);
        rows.push(currentRow);
        currentRow = [];
        currentCell = "";
        continue;
      }

      currentCell += char;
    }

    currentRow.push(currentCell);
    rows.push(currentRow);

    return rows;
  }

  private toDomain(product: ProductResponse, extras: ProductExtra[] = [], forcedVariants?: ProductVariant[]): ManagedProduct {
    const variants = forcedVariants ?? (product.Variants ?? product.variants ?? []).map((variant) => this.toDomainVariant(variant));
    const rawVariantsCount = product.VariantsCount ?? product.variantsCount;
    const parsedVariantsCount = typeof rawVariantsCount === "string" ? Number(rawVariantsCount.trim()) : Number(rawVariantsCount);
    const variantsCount = Number.isFinite(parsedVariantsCount) && parsedVariantsCount > 0
      ? parsedVariantsCount
      : variants.length;
    return new ManagedProduct(
      product.Id ?? product.id ?? 0,
      product.Business_Id ?? product.business_Id ?? product.businessId ?? 0,
      product.Name ?? product.name ?? "",
      product.Description ?? product.description ?? "",
      product.Color ?? product.color ?? null,
      product.ForSale ?? product.forSale ?? true,
      product.ShowInStore ?? product.showInStore ?? true,
      this.toAvailabilityFlag(product.Available ?? product.available),
      product.Volume ?? product.volume ?? false,
      product.Category_Id ?? product.category_Id ?? product.categoryId ?? null,
      product.Category_Name ?? product.category_Name ?? product.categoryName ?? null,
      product.Price ?? product.price ?? null,
      product.PromotionPrice ?? product.promotionPrice ?? null,
      product.CostPerItem ?? product.costPerItem ?? null,
      product.Stock ?? product.stock ?? null,
      product.ExpDate ?? product.expDate ?? null,
      product.MinStock ?? product.minStock ?? null,
      product.OptStock ?? product.optStock ?? null,
      product.Quantity ?? product.quantity ?? null,
      product.Image ?? product.image ?? null,
      product.Images ?? product.images ?? [],
      product.Barcode ?? product.barcode ?? null,
      variants,
      extras,
      variantsCount,
    );
  }

  private toDomainVariants(payload: LegacyVariantResponse[] | null): ProductVariant[] {
    if (!Array.isArray(payload)) {
      return [];
    }
    return payload.map((variant) => this.toDomainVariant(variant));
  }

  private normalizeVariantsPayload(payload: LegacyVariantResponse[] | { data?: LegacyVariantResponse[]; Data?: LegacyVariantResponse[]; variants?: LegacyVariantResponse[]; Variants?: LegacyVariantResponse[] } | null): LegacyVariantResponse[] | null {
    if (!payload) return null;
    if (Array.isArray(payload)) return payload;
    return payload.data ?? payload.Data ?? payload.variants ?? payload.Variants ?? null;
  }

  private toLegacy(payload: SaveManagedProductDto): ProductResponse {
    return {
      Id: payload.id,
      Business_Id: payload.businessId,
      Category_Id: payload.categoryId,
      Name: payload.name,
      Description: payload.description,
      Color: payload.color?.trim() || "#000000",
      ForSale: payload.forSale,
      ShowInStore: payload.showInStore,
      Available: payload.available,
      Images: payload.images,
      Barcode: payload.barcode,
      Price: payload.price,
      PromotionPrice: payload.promotionPrice ?? null,
      CostPerItem: payload.costPerItem,
      Stock: payload.stock,
      ExpDate: payload.expDate ?? null,
      MinStock: payload.minStock ?? null,
      OptStock: payload.optStock ?? null,
      Volume: payload.volume ?? false,
    };
  }

  private toDomainVariant(variant: LegacyVariantResponse): ProductVariant {
    return {
      id: variant.Id ?? variant.id,
      productId: variant.Product_Id ?? variant.product_Id,
      description: variant.Description ?? variant.description ?? "",
      barcode: variant.Barcode ?? variant.barcode ?? null,
      color: variant.Color ?? variant.color ?? null,
      size: variant.Size ?? variant.size ?? variant.Talla ?? variant.talla ?? null,
      price: variant.Price ?? variant.price ?? null,
      promotionPrice: variant.PromotionPrice ?? variant.promotionPrice ?? null,
      costPerItem: variant.CostPerItem ?? variant.costPerItem ?? null,
      stock: variant.Stock ?? variant.stock ?? null,
      expDate: variant.ExpDate ?? variant.expDate ?? null,
      minStock: variant.MinStock ?? variant.minStock ?? null,
      optStock: variant.OptStock ?? variant.optStock ?? null,
    };
  }

  private toLegacyVariant(variant: ProductVariant): LegacyVariantResponse {
    const normalizedSize = variant.size ?? null;

    return {
      Id: variant.id,
      Product_Id: variant.productId,
      Description: variant.description,
      Barcode: variant.barcode ?? null,
      Color: variant.color?.trim() || null,
      ...(normalizedSize ? { Size: normalizedSize, Talla: normalizedSize } : {}),
      Price: variant.price ?? null,
      PromotionPrice: variant.promotionPrice ?? null,
      CostPerItem: variant.costPerItem ?? null,
      Stock: variant.stock ?? null,
      ExpDate: variant.expDate ?? null,
      MinStock: variant.minStock ?? null,
      OptStock: variant.optStock ?? null,
    };
  }

  private toDomainExtras(payload: unknown): ProductExtra[] {
    if (!payload || typeof payload !== "object") return [];

    const record = payload as Record<string, unknown>;
    const colorRows = Array.isArray(record.COLOR) ? record.COLOR : [];
    const sizeRows = Array.isArray(record.TALLA) ? record.TALLA : [];

    return [...colorRows, ...sizeRows]
      .filter((row) => row && typeof row === "object")
      .map((row) => this.toDomainExtra(row as ExtraResponse));
  }

  private toDomainExtra(extra: ExtraResponse): ProductExtra {
    return {
      id: extra.Id ?? extra.id,
      productId: extra.Product_Id ?? extra.product_Id ?? extra.ProductId ?? extra.productId,
      description: String(extra.Description ?? extra.description ?? "").trim(),
      type: String(extra.Type ?? extra.type ?? "").trim() || "COLOR",
    };
  }

  private toLegacyCreateExtra(extra: ProductExtra): { Description: string; Type: string } {
    return {
      Description: extra.description.trim(),
      Type: extra.type,
    };
  }

  private toMutationBody(
    payload: SaveManagedProductDto,
    includeExtras: boolean,
    includeVariants: boolean,
  ): { Product: ProductResponse; Variants: LegacyVariantResponse[] | null; Extras?: Array<{ Description: string; Type: string }> | null } {
    const normalizedExtras = (payload.extras ?? [])
      .map((extra) => ({ description: extra.description.trim(), type: String(extra.type || "").trim() || "COLOR" }))
      .filter((extra) => extra.description.length > 0);

    return {
      Product: this.toLegacy(payload),
      Variants: includeVariants && payload.variants?.length ? payload.variants.map((variant) => this.toLegacyVariant(variant)) : null,
      ...(includeExtras ? { Extras: normalizedExtras.length ? normalizedExtras.map((extra) => this.toLegacyCreateExtra(extra)) : null } : {}),
    };
  }

  private async persistExtras(productId: number, extras: ProductExtra[], token: string): Promise<void> {
    const normalizedExtras = extras
      .map((extra) => ({ description: extra.description.trim(), type: String(extra.type || "").trim() || "COLOR" }))
      .filter((extra) => extra.description.length > 0);
    if (normalizedExtras.length === 0) return;

    await Promise.all(
      normalizedExtras.map((extra) => this.httpClient.request<void>({
        method: "POST",
        path: POS_ENDPOINTS.extras(),
        token,
        body: { Product_Id: productId, Description: extra.description, Type: extra.type },
      })),
    );
  }

  private async syncVariants(productId: number, variants: ProductVariant[], token: string): Promise<void> {
    const current = await this.httpClient.request<LegacyVariantResponse[] | null>({
      method: "GET",
      path: POS_ENDPOINTS.variantsByProduct(productId),
      token,
    }).catch(() => null);
    const currentRows = Array.isArray(current) ? current.map((variant) => this.toDomainVariant(variant)) : [];

    const desiredById = new Map(
      variants
        .filter((variant): variant is ProductVariant & { id: number } => typeof variant.id === "number")
        .map((variant) => [variant.id, variant]),
    );
    const currentIds = new Set(currentRows.filter((variant) => typeof variant.id === "number").map((variant) => variant.id as number));

    await Promise.all(
      variants.map((variant) => {
        const variantPayload = this.withoutVariantId(this.toLegacyVariant({ ...variant, productId }));

        if (typeof variant.id === "number") {
          return this.httpClient.request<void>({
            method: "PUT",
            path: POS_ENDPOINTS.variantById(variant.id),
            token,
            body: variantPayload,
          });
        }

        return this.httpClient.request<void>({
          method: "POST",
          path: POS_ENDPOINTS.variants(),
          token,
          body: variantPayload,
        });
      }),
    );

    const toDelete = [...currentIds].filter((id) => !desiredById.has(id));
    if (toDelete.length === 0) return;

    await Promise.all(
      toDelete.map((variantId) => this.httpClient.request<void>({
        method: "DELETE",
        path: POS_ENDPOINTS.variantById(variantId),
        token,
      })),
    );
  }

  private async syncExtras(productId: number, extras: ProductExtra[], token: string): Promise<void> {
    const currentPayload = await this.httpClient.request<unknown>({
      method: "GET",
      path: POS_ENDPOINTS.productExtras(productId),
      token,
    }).catch(() => null);

    const currentExtras = this.toDomainExtras(currentPayload);
    const currentByKey = new Map(
      currentExtras
        .filter((extra) => typeof extra.id === "number")
        .map((extra) => [this.toExtraKey(extra.description, extra.type), extra]),
    );

    const desiredRows = extras
      .map((extra) => ({
        description: extra.description.trim(),
        type: String(extra.type || "").trim().toUpperCase() || "COLOR",
      }))
      .filter((extra) => extra.description.length > 0);
    const desiredKeys = new Set(desiredRows.map((extra) => this.toExtraKey(extra.description, extra.type)));

    await Promise.all(
      desiredRows
        .filter((extra) => !currentByKey.has(this.toExtraKey(extra.description, extra.type)))
        .map((extra) => this.httpClient.request<void>({
          method: "POST",
          path: POS_ENDPOINTS.extras(),
          token,
          body: { Product_Id: productId, Description: extra.description, Type: extra.type },
        })),
    );

    const extraIdsToDelete = currentExtras
      .filter((extra) => typeof extra.id === "number")
      .filter((extra) => !desiredKeys.has(this.toExtraKey(extra.description, extra.type)))
      .map((extra) => extra.id as number);

    if (extraIdsToDelete.length === 0) return;

    await Promise.all(
      extraIdsToDelete.map((extraId) => this.httpClient.request<void>({
        method: "DELETE",
        path: POS_ENDPOINTS.extraById(extraId),
        token,
      })),
    );
  }

  private toExtraKey(description: string, type: string): string {
    return `${description.trim().toLowerCase()}::${type.trim().toUpperCase()}`;
  }

  private withoutVariantId(variant: LegacyVariantResponse): Omit<LegacyVariantResponse, "Id" | "id"> {
    const { Id: _variantId, id: _variantIdCamel, ...rest } = variant;
    return rest;
  }

  private extractCreatedProduct(response: ProductResponse | { Product?: ProductResponse; product?: ProductResponse; Id?: number; id?: number; insertId?: number } | null): ProductResponse | null {
    if (!response || typeof response !== "object") return null;
    if ("Product" in response && response.Product) return response.Product;
    if ("product" in response && response.product) return response.product;
    return response as ProductResponse;
  }

  private extractCreatedExtras(response: unknown): ProductExtra[] {
    if (!response || typeof response !== "object") return [];
    const record = response as Record<string, unknown>;
    if (!Array.isArray(record.Extras)) return [];
    return record.Extras
      .filter((row) => row && typeof row === "object")
      .map((row) => this.toDomainExtra(row as ExtraResponse));
  }

  private toLegacyCategory(category: ProductCategory): CategoryResponse {
    return {
      Id: category.id,
      Business_Id: category.businessId,
      Parent_Id: category.parentId ?? null,
      Name: category.name,
      Color: category.color,
    };
  }

  private toDomainCategory(category: CategoryResponse): ProductCategory {
    return {
      id: category.Id ?? category.id,
      businessId: category.Business_Id ?? category.business_Id ?? 0,
      parentId: category.Parent_Id ?? category.parent_Id ?? null,
      name: category.Name ?? category.name ?? "",
      color: category.Color ?? category.color ?? "",
    };
  }
}
