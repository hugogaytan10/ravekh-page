import { HttpClient } from "../../../../core/api/HttpClient";
import { POS_ENDPOINTS } from "../../../shared/api/posEndpoints";
import { toPaginationMeta } from "../../../shared/model/Pagination";
import { IProductsRepository, ProductImportResult, ProductsPaginatedResult } from "../interface/IProductsRepository";
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
  ShowPrice?: boolean | number | string | null;
  showPrice?: boolean | number | string | null;
  Showprice?: boolean | number | string | null;
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
  WholesalePrice?: number | null;
  wholesalePrice?: number | null;
  WholesaleMinQuantity?: number | null;
  wholesaleMinQuantity?: number | null;
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
  WholesalePrices?: Array<{ Id?: number; Product_Id?: number | null; Price?: number; MinQuantity?: number }>;
  wholesalePrices?: Array<{ id?: number; productId?: number | null; price?: number; minQuantity?: number }>;
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
  Image?: string | null;
  image?: string | null;
  Size?: string | null;
  size?: string | null;
  Talla?: string | null;
  talla?: string | null;
  Price?: number | null;
  price?: number | null;
  PromotionPrice?: number | null;
  promotionPrice?: number | null;
  WholesalePrice?: number | null;
  wholesalePrice?: number | null;
  WholesaleMinQuantity?: number | null;
  wholesaleMinQuantity?: number | null;
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
  WholesalePrices?: Array<{ Id?: number; Variant_Id?: number | null; Price?: number; MinQuantity?: number }>;
  wholesalePrices?: Array<{ id?: number; variantId?: number | null; price?: number; minQuantity?: number }>;
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

  private async requestBranchProducts(
    businessId: number,
    token: string,
    page = 1,
    limit: string | number = "MAX",
  ): Promise<{ rows: ProductResponse[]; pagination?: Record<string, unknown> }> {
    const payload = await this.httpClient.request<
      ProductResponse[] | { data?: ProductResponse[]; products?: ProductResponse[]; pagination?: Record<string, unknown> }
    >({
      method: "GET",
      path: POS_ENDPOINTS.productsByBusinessBranch(businessId),
      token,
      query: { page, limit },
    });

    return {
      rows: Array.isArray(payload) ? payload : payload.data ?? payload.products ?? [],
      pagination: Array.isArray(payload) ? undefined : payload.pagination,
    };
  }

  private async listAllBranchProducts(
    businessId: number,
    token: string,
    limit: string | number = "MAX",
  ): Promise<ProductResponse[]> {
    const first = await this.requestBranchProducts(businessId, token, 1, limit);
    const totalPages = Math.max(1, Number(first.pagination?.totalPages ?? 1));
    if (totalPages <= 1) return first.rows;

    const rest = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) =>
        this.requestBranchProducts(businessId, token, index + 2, limit),
      ),
    );

    return [first, ...rest].flatMap((page) => page.rows);
  }

  async listByBusiness(businessId: number, token: string): Promise<ManagedProduct[]> {
    const rows = await this.listAllBranchProducts(businessId, token);
    return rows.map((product) => this.toDomain(product));
  }

  async listAllByBusiness(businessId: number, token: string, limit: string): Promise<ManagedProduct[]> {
    const rows = await this.listAllBranchProducts(businessId, token, limit);
    return rows.map((product) => this.toDomain(product));
  }

  async listReallyAllByBusiness(businessId: number, token: string): Promise<ManagedProduct[]> {
    const rows = await this.listAllBranchProducts(businessId, token);
    return rows.map((product) => this.toDomain(product));
  }

  private async listProductsFromPath(path: string, token: string): Promise<ManagedProduct[]> {
    const products = await this.httpClient.request<ProductResponse[] | { data?: ProductResponse[]; Data?: ProductResponse[]; Products?: ProductResponse[] }>({
      method: "GET",
      path,
      token,
    });

    const rows = Array.isArray(products)
      ? products
      : products?.data ?? products?.Data ?? products?.Products ?? [];

    return rows.map((product) => this.toDomain(product));
  }

  async listByBusinessPaginated(businessId: number, token: string, page: number, limit: string | number): Promise<ProductsPaginatedResult> {
    const resolvedLimit = Math.max(1, Number(limit) || 20);
    const payload = await this.requestBranchProducts(businessId, token, page, limit);
    const categoryIds = Array.isArray(payload.pagination?.categoryIds)
      ? payload.pagination.categoryIds.map((id) => Number(id)).filter((id) => Number.isFinite(id))
      : [];
    return {
      products: payload.rows.map((product) => this.toDomain(product)),
      pagination: {
        ...toPaginationMeta(payload.pagination, page, resolvedLimit, payload.rows.length),
        categoryIds,
      },
    };
  }

  async listByBusinessNoAvailablePaginated(businessId: number, token: string, page: number, limit: string | number): Promise<ProductsPaginatedResult> {
    const resolvedLimit = Math.max(1, Number(limit) || 20);
    const payload = await this.httpClient.request<
      ProductResponse[] |
      { products?: ProductResponse[]; data?: ProductResponse[]; pagination?: Record<string, unknown> }
    >({
      method: "GET",
      path: POS_ENDPOINTS.productsNoAvailableByBusiness(businessId),
      token,
      query: { page, limit: resolvedLimit },
    });

    const rows = Array.isArray(payload) ? payload : payload?.products ?? payload?.data ?? [];
    const paginationPayload = Array.isArray(payload) ? undefined : payload?.pagination;
    const categoryIds = Array.isArray(paginationPayload?.categoryIds)
      ? paginationPayload.categoryIds.map((id) => Number(id)).filter((id) => Number.isFinite(id))
      : [];

    return {
      products: rows.map((product) => this.toDomain(product)),
      pagination: {
        ...toPaginationMeta(paginationPayload, page, resolvedLimit, rows.length),
        categoryIds,
      },
    };
  }


  async listByBusinessAllForSearch(businessId: number, token: string, limit: string | number): Promise<ManagedProduct[]> {
    const rows = await this.listAllBranchProducts(businessId, token, limit);
    return rows.map((product) => this.toDomain(product));
  }

  async getById(productId: number, token: string): Promise<ManagedProduct | null> {
    const product = await this.httpClient.request<ProductResponse | { data?: ProductResponse; Data?: ProductResponse } | null>({ method: "GET", path: POS_ENDPOINTS.productById(productId), token });
    if (!product) return null;
    const master = "data" in product || "Data" in product ? product.data ?? product.Data ?? null : product;
    if (!master) return null;
    const businessId = Number(master.Business_Id ?? master.business_Id ?? master.businessId ?? 0);
    const [branchRows, extrasResponse, variantsResponse] = await Promise.all([
      businessId ? this.listAllBranchProducts(businessId, token).catch(() => [] as ProductResponse[]) : Promise.resolve([] as ProductResponse[]),
      this.httpClient.request<unknown>({ method: "GET", path: POS_ENDPOINTS.productExtras(productId), token }).catch(() => null),
      this.httpClient.request<LegacyVariantResponse[] | { data?: LegacyVariantResponse[]; Data?: LegacyVariantResponse[]; variants?: LegacyVariantResponse[]; Variants?: LegacyVariantResponse[] } | null>({ method: "GET", path: POS_ENDPOINTS.variantsByProductBranch(productId), token }).catch(() => null),
    ]);
    const effective = branchRows.find((row) => Number(row.Id ?? row.id) === productId);
    if (!effective) return null;
    const merged: ProductResponse = { ...master, ...effective, Images: effective.Images ?? effective.images ?? master.Images ?? master.images };
    return this.toDomain(merged, this.toDomainExtras(extrasResponse), this.toDomainVariants(this.normalizeVariantsPayload(variantsResponse)));
  }

  async create(payload: SaveManagedProductDto, token: string): Promise<ManagedProduct> {
    const created = await this.httpClient.request<{ success?: boolean; data?: { productId?: number } } | { productId?: number }>({ method: "POST", path: POS_ENDPOINTS.productsByBusinessBranch(payload.businessId), token, body: this.toBranchProductPayload(payload) });
    const wrapper = created as { data?: { productId?: number }; productId?: number };
    const productId = Number(wrapper.data?.productId ?? wrapper.productId ?? 0);
    if (!productId) throw new Error("El backend no devolvió el id del producto creado.");
    await this.httpClient.request<unknown>({ method: "PUT", path: POS_ENDPOINTS.productById(productId), token, body: this.toLegacyMasterPayload({ ...payload, id: productId }) });
    await Promise.all([this.syncExtras(productId, payload.extras ?? [], token), this.syncVariants(productId, payload.variants ?? [], token)]);
    return (await this.getById(productId, token)) ?? this.toDomain({ ...this.toLegacy(payload), Id: productId }, payload.extras ?? [], payload.variants ?? []);
  }

  async addProductExtras(productId: number, extras: ProductExtra[], token: string): Promise<void> {
    const normalized = Array.from(
      new Map(
        extras
          .map((extra) => ({
            ...extra,
            description: extra.description.trim(),
            type: String(extra.type || "").trim().toUpperCase() || "COLOR",
          }))
          .filter((extra) => extra.description.length > 0)
          .map((extra) => [this.toExtraKey(extra.description, extra.type), extra]),
      ).values(),
    );

    if (normalized.length === 0) return;

    const currentPayload = await this.httpClient.request<unknown>({
      method: "GET",
      path: POS_ENDPOINTS.productExtras(productId),
      token,
    }).catch(() => null);

    const currentKeys = new Set(
      this.toDomainExtras(currentPayload).map((extra) =>
        this.toExtraKey(extra.description, extra.type),
      ),
    );

    const missingExtras = normalized.filter(
      (extra) => !currentKeys.has(this.toExtraKey(extra.description, extra.type)),
    );

    await this.persistExtras(productId, missingExtras, token);
  }

  async update(payload: SaveManagedProductDto, token: string): Promise<ManagedProduct> {
    if (!payload.id) throw new Error("Product id is required for updates.");
    await this.httpClient.request<unknown>({ method: "PUT", path: POS_ENDPOINTS.productById(payload.id), token, body: this.toLegacyMasterPayload(payload) });
    await this.httpClient.request<unknown>({ method: "PATCH", path: POS_ENDPOINTS.branchProductById(payload.businessId, payload.id), token, body: this.toBranchProductPayload(payload) });
    await Promise.all([this.syncVariants(payload.id, payload.variants ?? [], token), this.syncExtras(payload.id, payload.extras ?? [], token)]);
    return (await this.getById(payload.id, token)) ?? this.toDomain(this.toLegacy(payload), payload.extras ?? [], payload.variants ?? []);
  }

  private toAvailabilityFlag(value: ProductResponse["Available"]): boolean {
    if (value === null || value === false || value === 0 || value === "0") return false;
    if (value === true || value === 1 || value === "1") return true;
    return value === undefined ? true : Boolean(value);
  }

  async archive(productId: number, token: string): Promise<void> {
    const businessId = Number(window.localStorage.getItem("pos-v2-business-id") ?? 0);
    if (!businessId) throw new Error("No encontramos el negocio de la sesión.");
    await this.httpClient.request<void>({ method: "PATCH", path: POS_ENDPOINTS.branchProductById(businessId, productId), token, body: { Available: 0 } });
  }

  async archiveMany(productIds: number[], token: string): Promise<void> { await Promise.all(productIds.map((productId) => this.archive(productId, token))); }

  async restore(productId: number, token: string): Promise<void> {
    const businessId = Number(window.localStorage.getItem("pos-v2-business-id") ?? 0);
    if (!businessId) throw new Error("No encontramos el negocio de la sesión.");
    await this.httpClient.request<void>({ method: "PATCH", path: POS_ENDPOINTS.branchProductById(businessId, productId), token, body: { Available: 1 } });
  }

  async restoreMany(productIds: number[], token: string): Promise<void> { await Promise.all(productIds.map((productId) => this.restore(productId, token))); }

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

  async importProducts(businessId: number, file: File, token: string): Promise<ProductImportResult> {
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

  async importProductsZip(businessId: number, file: File, token: string): Promise<ProductImportResult> {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension !== "zip") {
      throw new Error("Selecciona un archivo .zip con productos.csv e imágenes.");
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await this.httpClient.request<{ imported?: number; message?: string; total?: number; created?: number; updated?: number; errors?: string[] }>({
      method: "POST",
      path: POS_ENDPOINTS.productImport(businessId),
      token,
      body: formData,
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
      this.toAvailabilityFlag(product.ShowPrice ?? product.showPrice ?? product.Showprice),
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
      product.WholesalePrice ?? product.wholesalePrice ?? null,
      product.WholesaleMinQuantity ?? product.wholesaleMinQuantity ?? null,
      (product.WholesalePrices ?? product.wholesalePrices ?? []).map((tier) => ({
        id: "Id" in tier ? tier.Id : tier.id,
        productId: "Product_Id" in tier ? tier.Product_Id ?? null : tier.productId ?? null,
        price: Number(tier.Price ?? tier.price ?? 0),
        minQuantity: Number(tier.MinQuantity ?? tier.minQuantity ?? 0),
      })),
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

  private toBranchProductPayload(payload: SaveManagedProductDto): Record<string, unknown> {
    const usesVariants = Array.isArray(payload.variants) && payload.variants.length > 0;
    const body: Record<string, unknown> = {
      Barcode: payload.barcode ?? null,
      Category_Id: payload.categoryId ?? null,
      Name: payload.name,
      Color: payload.color?.trim() || null,
      Description: payload.description,
      CostPerItem: payload.costPerItem ?? null,
      ForSale: payload.forSale ? 1 : 0,
      Volume: payload.volume ? 1 : 0,
      ExpDate: payload.expDate ?? null,
      Price: payload.price ?? null,
      PromotionPrice: payload.promotionPrice ?? null,
      ShowInStore: payload.showInStore ? 1 : 0,
      Available: payload.available ? 1 : 0,
      Showprice: payload.showPrice ? 1 : 0,
      Source: "MANUAL",
    };

    // El inventario de un producto con variantes vive en branch_variant_inventory.
    // Enviar Stock al endpoint del producto provocaría que el backend rechace la
    // actualización (y, peor aún, conceptualmente duplicaría inventario).
    if (!usesVariants) {
      body.Stock = payload.stock ?? 0;
      body.MinStock = payload.minStock ?? null;
      body.OptStock = payload.optStock ?? null;
    }

    return body;
  }

  private toLegacyMasterPayload(payload: SaveManagedProductDto): Record<string, unknown> {
    return {
      Business_Id: payload.businessId,
      Category_Id: payload.categoryId ?? null,
      Name: payload.name,
      Description: payload.description,
      Color: payload.color?.trim() || "#000000",
      ForSale: payload.forSale,
      Volume: payload.volume ?? false,
      Images: payload.images ?? [],
      Barcode: payload.barcode ?? null,
      CostPerItem: payload.costPerItem ?? null,
      ExpDate: payload.expDate ?? null,
      WholesalePrices: (payload.wholesalePrices ?? []).map((tier) => ({
        Id: tier.id,
        Product_Id: payload.id ?? null,
        Price: tier.price,
        MinQuantity: tier.minQuantity,
      })),
    };
  }

  private toBranchVariantPayload(variant: ProductVariant): Record<string, unknown> {
    return {
      Barcode: variant.barcode ?? null,
      Description: variant.description,
      Color: variant.color?.trim() || null,
      Image: variant.Image ?? null,
      Price: variant.price ?? null,
      PromotionPrice: variant.promotionPrice ?? null,
      CostPerItem: variant.costPerItem ?? null,
      Stock: variant.stock ?? 0,
      ExpDate: variant.expDate ?? null,
      MinStock: variant.minStock ?? null,
      OptStock: variant.optStock ?? null,
      Visible: 1,
      Available: 1,
      WholesalePrices: (variant.wholesalePrices ?? []).map((tier) => ({
        Id: tier.id,
        Variant_Id: variant.id ?? null,
        Price: tier.price,
        MinQuantity: tier.minQuantity,
      })),
    };
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
      Showprice: payload.showPrice,
      Available: payload.available,
      Images: payload.images,
      Barcode: payload.barcode,
      Price: payload.price,
      PromotionPrice: payload.promotionPrice ?? null,
      WholesalePrice: payload.wholesalePrice ?? null,
      WholesaleMinQuantity: payload.wholesaleMinQuantity ?? null,
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
      Image: variant.Image ?? variant.image ?? null,
      size: variant.Size ?? variant.size ?? variant.Talla ?? variant.talla ?? null,
      price: variant.Price ?? variant.price ?? null,
      promotionPrice: variant.PromotionPrice ?? variant.promotionPrice ?? null,
      wholesalePrice: variant.WholesalePrice ?? variant.wholesalePrice ?? null,
      wholesaleMinQuantity: variant.WholesaleMinQuantity ?? variant.wholesaleMinQuantity ?? null,
      costPerItem: variant.CostPerItem ?? variant.costPerItem ?? null,
      stock: variant.Stock ?? variant.stock ?? null,
      expDate: variant.ExpDate ?? variant.expDate ?? null,
      minStock: variant.MinStock ?? variant.minStock ?? null,
      optStock: variant.OptStock ?? variant.optStock ?? null,
      wholesalePrices: (variant.WholesalePrices ?? variant.wholesalePrices ?? []).map((tier) => ({
        id: "Id" in tier ? tier.Id : tier.id,
        variantId: "Variant_Id" in tier ? tier.Variant_Id ?? null : tier.variantId ?? null,
        price: Number(tier.Price ?? tier.price ?? 0),
        minQuantity: Number(tier.MinQuantity ?? tier.minQuantity ?? 0),
      })),
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
      Image: variant.Image ?? null,
      ...(normalizedSize ? { Size: normalizedSize, Talla: normalizedSize } : {}),
      Price: variant.price ?? null,
      PromotionPrice: variant.promotionPrice ?? null,
      WholesalePrice: variant.wholesalePrice ?? null,
      WholesaleMinQuantity: variant.wholesaleMinQuantity ?? null,
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
    const currentPayload = await this.httpClient.request<LegacyVariantResponse[] | { data?: LegacyVariantResponse[]; Data?: LegacyVariantResponse[]; variants?: LegacyVariantResponse[]; Variants?: LegacyVariantResponse[] } | null>({ method: "GET", path: POS_ENDPOINTS.variantsByProductBranch(productId), token }).catch(() => null);
    const currentRows = this.toDomainVariants(this.normalizeVariantsPayload(currentPayload));
    const desiredIds = new Set(variants.filter((variant) => typeof variant.id === "number").map((variant) => variant.id as number));
    await Promise.all(variants.map((variant) => {
      const body = this.toBranchVariantPayload({ ...variant, productId });
      return typeof variant.id === "number"
        ? this.httpClient.request<void>({ method: "PATCH", path: POS_ENDPOINTS.variantByIdBranch(variant.id), token, body })
        : this.httpClient.request<void>({ method: "POST", path: POS_ENDPOINTS.variantsByProductBranch(productId), token, body });
    }));
    const removed = currentRows.filter((variant) => typeof variant.id === "number" && !desiredIds.has(variant.id as number));
    await Promise.all(removed.map((variant) => this.httpClient.request<void>({ method: "PATCH", path: POS_ENDPOINTS.variantByIdBranch(variant.id as number), token, body: { Visible: 0, Available: 0 } })));
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
