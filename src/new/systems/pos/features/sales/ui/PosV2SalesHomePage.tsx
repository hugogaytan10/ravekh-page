import { useEffect, useMemo, useState } from "react";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import { FiCreditCard, FiDollarSign, FiGrid, FiRepeat, FiShoppingBag, FiTrash2 } from "react-icons/fi";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import "./PosV2SalesHomePage.css";
import { ModernSystemsFactory } from "../../../../../index";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { POS_SESSION_STORAGE_KEYS, readPosSessionSnapshot } from "../../../shared/config/posSession";
import { getDefaultPosPrinter, readPosPrinters } from "../../../shared/config/posPrinters";

type SaleItemVm = {
  id: number;
  name: string;
  price: number;
  stock: number | null;
  category: string;
  color: string | null;
  image?: string;
  variants: SaleVariantVm[];
};

type SaleVariantVm = {
  id: number | null;
  description: string;
  color: string | null;
  size: string | null;
  price: number;
  stock: number | null;
};

type CartItemVm = {
  cartKey: string;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  variantId: number | null;
  variantLabel: string | null;
  colorId: number | null;
  sizeId: number | null;
  colorLabel: string | null;
  sizeLabel: string | null;
};

type PaymentMethod = "EFECTIVO" | "TARJETA DE DEBITO" | "TARJETA DE CREDITO" | "MONEDERO" | "LINK DE PAGO" | "OTROS";
type MobileStep = "catalog" | "cart" | "checkout";
type CompletedSaleLine = {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};
type CompletedSale = {
  folio: string;
  paymentMethodLabel: string;
  table: string;
  total: number;
  customerName?: string;
  createdAt: string;
  items: CompletedSaleLine[];
};

const getIsoDate = (offsetDays = 0): string => {
  const date = new Date();
  if (offsetDays) {
    date.setDate(date.getDate() + offsetDays);
  }
  return date.toISOString().slice(0, 10);
};

const isMobileDevice = (): boolean =>
  /Android|iPhone|iPad|iPod|Windows Phone|webOS/i.test(window.navigator.userAgent || "");

const printHtmlDocument = (title: string, html: string): boolean => {
  const previewBlob = new Blob([html], { type: "text/html;charset=utf-8" });
  const previewUrl = URL.createObjectURL(previewBlob);
  const mobile = isMobileDevice();
  const targetWindow = window.open(previewUrl, "_blank", mobile ? undefined : "noopener,noreferrer,width=820,height=960");

  if (targetWindow) {
    targetWindow.focus();
    window.setTimeout(() => URL.revokeObjectURL(previewUrl), 60_000);
    return true;
  }

  if (mobile) {
    window.location.href = previewUrl;
    return true;
  }

  URL.revokeObjectURL(previewUrl);
  return false;
};

type CustomerVm = {
  id: number;
  name: string;
};

type CategoryVm = {
  id: number;
  name: string;
};

type ProductExtraOptionVm = {
  id: number;
  description: string;
};

type ProductExtrasVm = {
  COLOR: ProductExtraOptionVm[];
  TALLA: ProductExtraOptionVm[];
} | null;

type VariantApiResponse = {
  Id?: number | null;
  Description?: string | null;
  Color?: string | null;
  Size?: string | null;
  Talla?: string | null;
  Price?: number | null;
  PromotionPrice?: number | null;
  Stock?: number | null;
};
type TableApiResponse = {
  Id?: number | null;
  Name?: string | null;
  IsAvailable?: boolean | number | null;
  Table_Zone_Id?: number | null;
  TableZoneId?: number | null;
  Zone_Id?: number | null;
};

type TableZoneApiResponse = {
  Id?: number | null;
  Name?: string | null;
  Active?: boolean | number | string | null;
  Tables?: TableApiResponse[] | null;
};

const PAYMENT_METHOD_OPTIONS: Array<{
  value: PaymentMethod;
  label: string;
  Icon: typeof FiDollarSign;
}> = [
  { value: "EFECTIVO", label: "Efectivo", Icon: FiDollarSign },
  { value: "TARJETA DE DEBITO", label: "Tarjeta débito", Icon: FiCreditCard },
  { value: "TARJETA DE CREDITO", label: "Tarjeta crédito", Icon: FiCreditCard },
  { value: "MONEDERO", label: "Monedero", Icon: FiRepeat },
  { value: "LINK DE PAGO", label: "Link de pago", Icon: FiRepeat },
  { value: "OTROS", label: "Otros", Icon: FiRepeat },
];

const API_BASE_URL = getPosApiBaseUrl();
const EMPLOYEE_ID_KEY = POS_SESSION_STORAGE_KEYS.employeeId;
const DEFAULT_SALES_LIMIT = "EMPRENDEDOR";
const DEBUG_KEY = "pos-v2-debug";
type TableZoneVm = {
  id: number;
  name: string;
  isActive: boolean;
};

type TableVm = {
  id: number;
  name: string;
  zoneId: number | null;
};
type SalesTaxVm = {
  enabled: boolean;
  description: string;
  value: number;
  isPercent: boolean;
  canBeRemovedAtSale: boolean;
};

type TokenPayload = {
  Id?: number | string;
  id?: number | string;
  employeeId?: number | string;
  Employee_Id?: number | string;
  sub?: number | string;
};

const toAbsoluteImageUrl = (image?: string | null): string | undefined => {
  if (!image) return undefined;

  const candidate = image.trim();
  if (!candidate) return undefined;

  if (/^https?:\/\//i.test(candidate) || candidate.startsWith("data:")) {
    return candidate;
  }

  const normalizedPath = candidate.startsWith("/") ? candidate.slice(1) : candidate;

  try {
    return new URL(normalizedPath, API_BASE_URL).toString();
  } catch {
    return undefined;
  }
};

const toCartKey = (
  productId: number,
  variantId: number | null,
  colorId: number | null = null,
  sizeId: number | null = null,
): string => `${productId}:${variantId ?? "base"}:${colorId ?? "none"}:${sizeId ?? "none"}`;

const toVariantLabel = (variant: SaleVariantVm): string => {
  const label = variant.description.trim();
  return label.length > 0 ? label : "Variante";
};

export const PosV2SalesHomePage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categoryKey, setCategoryKey] = useState("all");
  const [isGrid, setIsGrid] = useState(true);
  const [products, setProducts] = useState<SaleItemVm[]>([]);
  const [categories, setCategories] = useState<CategoryVm[]>([]);
  const [availableCategoryIds, setAvailableCategoryIds] = useState<number[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [cart, setCart] = useState<Record<string, CartItemVm>>({});
  const [discountPercent, setDiscountPercent] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("EFECTIVO");
  const [ticket, setTicket] = useState<string | null>(null);
  const [mobileStep, setMobileStep] = useState<MobileStep>("catalog");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isCompletingSale, setIsCompletingSale] = useState(false);
  const [tables, setTables] = useState<TableVm[]>([]);
  const [tableZones, setTableZones] = useState<TableZoneVm[]>([]);
  const [tablesByZone, setTablesByZone] = useState<Record<number, TableVm[]>>({});
  const [selectedTableZoneId, setSelectedTableZoneId] = useState<string>("");
  const [selectedTableId, setSelectedTableId] = useState<string>("");
  const [completedSale, setCompletedSale] = useState<CompletedSale | null>(null);
  const [quoteBusinessName, setQuoteBusinessName] = useState("Mi negocio");
  const [quoteClientName, setQuoteClientName] = useState("");
  const [quoteLogoUrl, setQuoteLogoUrl] = useState("");
  const [quoteIssueDate, setQuoteIssueDate] = useState(() => getIsoDate(0));
  const [quoteValidUntil, setQuoteValidUntil] = useState(() => getIsoDate(7));
  const [isMobileTablesOpen, setIsMobileTablesOpen] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [tablesError, setTablesError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<CustomerVm[]>([]);
  const [customersError, setCustomersError] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [salesTax, setSalesTax] = useState<SalesTaxVm | null>(null);
  const [applyTax, setApplyTax] = useState(false);
  const [taxError, setTaxError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [planLimit, setPlanLimit] = useState(() => (window.localStorage.getItem("plan") ?? "").trim() || DEFAULT_SALES_LIMIT);
  const [variantSelection, setVariantSelection] = useState<{
    product: SaleItemVm;
    variants: SaleVariantVm[];
    extras: ProductExtrasVm;
    selectedVariantKey: string | null;
    selectedSizeId: number | null;
    quantities: Record<string, number>;
  } | null>(null);
  const [extrasCache, setExtrasCache] = useState<Record<number, ProductExtrasVm>>({});
  const [variantsCache, setVariantsCache] = useState<Record<number, SaleVariantVm[]>>({});
  const [uiMessage, setUiMessage] = useState<string>("");
  const [variantModalError, setVariantModalError] = useState<string | null>(null);

  const debugLog = (...args: unknown[]) => {
    if (window.localStorage.getItem(DEBUG_KEY) === "true") {
      console.log("[POS-V2-SALES]", ...args);
    }
  };

  const getCurrentSession = () => readPosSessionSnapshot();

  useEffect(() => {
    const { token, businessId } = getCurrentSession();
    const categoryId = categoryKey === "all" ? null : Number(categoryKey);

    if (!token || !businessId) {
      setProducts([]);
      setLoadingProducts(false);
      setProductsError("No encontramos sesión activa de negocio para cargar productos.");
      return;
    }

    const factory = new ModernSystemsFactory(API_BASE_URL);
    const productService = factory.createPosProductService();

    setLoadingProducts(true);
    setProductsError(null);
    productService
      .getSellableProductsPaginated(businessId, token, planLimit, currentPage, Number.isFinite(categoryId) ? categoryId : null)
      .then((response) => {
        const mapped: SaleItemVm[] = response.products.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          stock: item.stock,
          category: item.categoryName?.trim() || "General",
          color: item.color?.trim() || null,
          image: toAbsoluteImageUrl(item.image || item.images?.find(Boolean)),
          variants: item.variants.map((variant) => {
            const variantPrice = typeof variant.promotionPrice === "number" && variant.promotionPrice > 0
              ? variant.promotionPrice
              : variant.price ?? item.price;

            return {
              id: variant.id,
              description: variant.description.trim(),
              color: variant.color,
              size: variant.size,
              price: variantPrice,
              stock: variant.stock,
            };
          }),
        }));

        setProducts(mapped);
        setCurrentPage(response.pagination.page);
        setTotalPages(response.pagination.totalPages);
        setHasNextPage(response.pagination.hasNext || response.pagination.page < response.pagination.totalPages);
        setHasPrevPage(response.pagination.hasPrev || response.pagination.page > 1);

        if (categoryId === null) {
          setAvailableCategoryIds(response.pagination.categoryIds);
        }
      })
      .catch((error) => {
        setProducts([]);
        setProductsError(error instanceof Error ? error.message : "No pudimos cargar tus productos.");
      })
      .finally(() => setLoadingProducts(false));
  }, [categoryKey, currentPage, planLimit]);

  useEffect(() => {
    const { token, businessId } = getCurrentSession();

    if (!token || !businessId) {
      return;
    }

    const factory = new ModernSystemsFactory(API_BASE_URL);
    const businessService = factory.createPosBusinessSettingsService();

    businessService
      .getSettings(businessId, token)
      .then((settings) => {
        const normalizedPlan = (settings.plan ?? "").trim();
        if (!normalizedPlan) return;
        setPlanLimit(normalizedPlan);
        window.localStorage.setItem("plan", normalizedPlan);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const { token, businessId } = getCurrentSession();
    if (!token || !businessId) return;

    fetch(new URL(`business/${businessId}`, API_BASE_URL).toString(), {
      headers: {
        "Content-Type": "application/json",
        token,
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { Name?: string; name?: string; Logo?: string; logo?: string } | null) => {
        if (!payload) return;
        const businessName = String(payload.Name ?? payload.name ?? "").trim();
        const logoUrl = String(payload.Logo ?? payload.logo ?? "").trim();
        if (businessName) setQuoteBusinessName(businessName);
        if (logoUrl) setQuoteLogoUrl(logoUrl);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const { token, businessId } = getCurrentSession();

    if (!token || !businessId) {
      setSalesTax(null);
      setApplyTax(false);
      return;
    }

    const factory = new ModernSystemsFactory(API_BASE_URL);
    const salesTaxPage = factory.createPosSalesTaxPage();

    salesTaxPage
      .getSalesTaxSettings(businessId, token)
      .then((settings) => {
        if (!settings.enabled) {
          setSalesTax(null);
          setApplyTax(false);
          setTaxError(null);
          return;
        }

        setSalesTax({
          enabled: settings.enabled,
          description: settings.description?.trim() || "Impuesto",
          value: settings.value,
          isPercent: settings.isPercent,
          canBeRemovedAtSale: settings.canBeRemovedAtSale,
        });
        setApplyTax(true);
        setTaxError(null);
      })
      .catch((cause) => {
        setSalesTax(null);
        setApplyTax(false);
        setTaxError(cause instanceof Error ? cause.message : "No fue posible cargar impuesto de venta.");
      });
  }, []);

  useEffect(() => {
    const { token, businessId } = getCurrentSession();

    if (!token || !businessId) {
      setCustomers([]);
      return;
    }

    const factory = new ModernSystemsFactory(API_BASE_URL);
    const customerService = factory.createPosCustomerService();

    customerService
      .listCustomers(businessId, token)
      .then((items) => {
        const mapped = items.map((customer) => ({ id: customer.id, name: customer.name.trim() || `Cliente #${customer.id}` }));
        setCustomers(mapped);
        setCustomersError(null);
      })
      .catch((cause) => {
        setCustomers([]);
        setCustomersError(cause instanceof Error ? cause.message : "No fue posible cargar clientes.");
      });
  }, []);

  useEffect(() => {
    if (!selectedCustomerId) return;
    const selectedCustomer = customers.find((customer) => String(customer.id) === selectedCustomerId);
    if (selectedCustomer?.name) {
      setQuoteClientName(selectedCustomer.name);
    }
  }, [selectedCustomerId, customers]);

  useEffect(() => {
    const { token, businessId } = getCurrentSession();

    if (!token || !businessId) {
      setTables([]);
      setTableZones([]);
      setTablesError("No encontramos sesión para cargar zonas y mesas.");
      return;
    }

    const headers = {
      "Content-Type": "application/json",
      token,
      Authorization: `Bearer ${token}`,
    };

    setLoadingTables(true);

    fetch(new URL(`table_zones/business/${businessId}`, API_BASE_URL).toString(), { headers })
      .then(async (zonesResponse) => {
        if (!zonesResponse.ok) {
          throw new Error(`No se pudieron cargar zonas (${zonesResponse.status}).`);
        }

        const zonesPayload = (await zonesResponse.json().catch(() => null)) as TableZoneApiResponse[] | null;
        const rawZones = Array.isArray(zonesPayload) ? zonesPayload : [];
        const normalizedZones = rawZones
          .map((zone) => ({
            id: Number(zone.Id ?? 0),
            name: String(zone.Name ?? "").trim(),
            isActive: zone.Active === true || zone.Active === 1 || zone.Active === "1" || zone.Active === "true",
          }))
          .filter((zone) => zone.id > 0 && zone.name.length > 0)
          .sort((a, b) => a.id - b.id);

        const preloadedTables: Record<number, TableVm[]> = {};
        rawZones.forEach((zone) => {
          const zoneId = Number(zone.Id ?? 0);
          const rows = Array.isArray(zone.Tables) ? zone.Tables : [];
          if (zoneId <= 0 || rows.length === 0) return;

          preloadedTables[zoneId] = rows
            .map((table) => ({
              id: Number(table.Id ?? 0),
              name: String(table.Name ?? "").trim(),
              isAvailable: table.IsAvailable === true || table.IsAvailable === 1,
              zoneId: Number(table.Table_Zone_Id ?? table.TableZoneId ?? table.Zone_Id ?? zoneId) || zoneId,
            }))
            .filter((table) => table.id > 0 && table.name.length > 0 && table.isAvailable)
            .map(({ id, name, zoneId }) => ({ id, name, zoneId }))
            .sort((a, b) => a.id - b.id);
        });

        return { normalizedZones, preloadedTables };
      })
      .then(({ normalizedZones, preloadedTables }) => {
        debugLog("Zonas cargadas desde endpoint /table_zones/business/:businessId", normalizedZones);
        setTableZones(normalizedZones);
        setTablesByZone(preloadedTables);
        setTablesError(null);
      })
      .catch((error) => {
        console.error("[POS-V2-SALES] Error al cargar zonas", error);
        setTables([]);
        setTableZones([]);
        setTablesByZone({});
        setTablesError(error instanceof Error ? error.message : "No se pudieron cargar zonas.");
      })
      .finally(() => setLoadingTables(false));
  }, []);

  useEffect(() => {
    if (tableZones.length === 0) {
      setSelectedTableZoneId("");
      setSelectedTableId("");
      return;
    }

    if (!tableZones.some((zone) => String(zone.id) === selectedTableZoneId)) {
      setSelectedTableZoneId(String(tableZones[0]?.id ?? ""));
      setSelectedTableId("");
    }
  }, [tableZones, selectedTableZoneId]);

  useEffect(() => {
    const { token } = getCurrentSession();
    if (!token || !selectedTableZoneId) {
      setTables([]);
      return;
    }

    const currentZoneId = Number(selectedTableZoneId);
    if (Number.isFinite(currentZoneId) && currentZoneId > 0 && tablesByZone[currentZoneId]) {
      setTables(tablesByZone[currentZoneId] ?? []);
      return;
    }

    const headers = {
      "Content-Type": "application/json",
      token,
      Authorization: `Bearer ${token}`,
    };

    setLoadingTables(true);
    fetch(new URL(`tables/zone/${selectedTableZoneId}`, API_BASE_URL).toString(), { headers })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`No se pudieron cargar mesas (${response.status}).`);
        }

        const tablesPayload = (await response.json().catch(() => null)) as TableApiResponse[] | null;
        return (Array.isArray(tablesPayload) ? tablesPayload : [])
          .map((table) => ({
            id: Number(table.Id ?? 0),
            name: String(table.Name ?? "").trim(),
            isAvailable: table.IsAvailable === true || table.IsAvailable === 1,
            zoneId: Number(table.Table_Zone_Id ?? table.TableZoneId ?? table.Zone_Id ?? 0) || null,
          }))
          .filter((table) => table.id > 0 && table.name.length > 0 && table.isAvailable)
          .map(({ id, name, zoneId }) => ({ id, name, zoneId }))
          .sort((a, b) => a.id - b.id);
      })
      .then((zoneTables) => {
        debugLog(`Mesas cargadas desde endpoint /tables/zone/${selectedTableZoneId}`, zoneTables);
        setTables(zoneTables);
        setTablesByZone((current) => ({
          ...current,
          [Number(selectedTableZoneId)]: zoneTables,
        }));
        setTablesError(null);
      })
      .catch((error) => {
        console.error("[POS-V2-SALES] Error al cargar mesas por zona", error);
        setTables([]);
        setTablesError(error instanceof Error ? error.message : "No se pudieron cargar mesas.");
      })
      .finally(() => setLoadingTables(false));
  }, [selectedTableZoneId, tablesByZone]);

  const visibleTables = useMemo(() => tables, [tables]);

  useEffect(() => {
    if (visibleTables.length === 0) {
      setSelectedTableId("");
      return;
    }

    if (!visibleTables.some((table) => String(table.id) === selectedTableId)) {
      setSelectedTableId("");
    }
  }, [visibleTables, selectedTableId]);

  useEffect(() => {
    const { token, businessId } = getCurrentSession();

    if (!token || !businessId) {
      setCategories([]);
      return;
    }

    const factory = new ModernSystemsFactory(API_BASE_URL);
    const productService = factory.createPosProductService();

    productService
      .getBusinessCategories(businessId, token)
      .then((rows) => setCategories(rows.map((row) => ({ id: row.id, name: row.name }))))
      .catch(() => setCategories([]));
  }, []);

  const categoryOptions = useMemo(() => {
    const dynamic = categories.filter((item) => availableCategoryIds.length === 0 || availableCategoryIds.includes(item.id));
    return [{ key: "all", label: "Todas" }, ...dynamic.map((item) => ({ key: String(item.id), label: item.name }))];
  }, [availableCategoryIds, categories]);

  useEffect(() => {
    if (!categoryOptions.some((item) => item.key === categoryKey)) {
      setCategoryKey("all");
    }
  }, [categoryOptions, categoryKey]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => product.name.toLowerCase().includes(search.toLowerCase()));
  }, [products, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryKey, search]);

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  useEffect(() => {
    if (!uiMessage) return;
    const timeout = window.setTimeout(() => setUiMessage(""), 2200);
    return () => window.clearTimeout(timeout);
  }, [uiMessage]);

  useEffect(() => {
    if (!variantSelection) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setVariantSelection(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [variantSelection]);

  const cartItems = useMemo(() => Object.values(cart), [cart]);
  const hasTableSelection = tableZones.length > 0 && visibleTables.length > 0;
  const hasCustomers = customers.length > 0;
  const selectedTableName = useMemo(
    () => visibleTables.find((table) => String(table.id) === selectedTableId)?.name ?? "Sin mesa",
    [visibleTables, selectedTableId],
  );

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const discount = subtotal * (Number(discountPercent) / 100);
    const taxableBase = Math.max(0, subtotal - discount);
    const taxAmount = salesTax && applyTax
      ? salesTax.isPercent
        ? taxableBase * (salesTax.value / 100)
        : salesTax.value
      : 0;
    const total = Math.max(0, taxableBase + taxAmount);
    const items = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return { subtotal, discount, taxableBase, taxAmount, total, items };
  }, [applyTax, cartItems, discountPercent, salesTax]);

  const mobileSteps = useMemo(
    () => [
      {
        key: "catalog" as const,
        label: "Catálogo",
        Icon: ({ active }: { active: boolean }) => (
          <FiGrid size={16} color={active ? "#ffffff" : "#6D01D1"} />
        ),
      },
      {
        key: "cart" as const,
        label: "Cantidad",
        helper: totals.items ? `${totals.items} prod.` : undefined,
        Icon: ({ active }: { active: boolean }) => (
          <FiShoppingBag size={16} color={active ? "#ffffff" : "#6D01D1"} />
        ),
      },
      {
        key: "checkout" as const,
        label: "Cobro",
        Icon: ({ active }: { active: boolean }) => (
          <FiDollarSign size={16} color={active ? "#ffffff" : "#6D01D1"} />
        ),
      },
    ],
    [totals.items],
  );

  const loadProductExtras = async (productId: number): Promise<ProductExtrasVm> => {
    if (Object.prototype.hasOwnProperty.call(extrasCache, productId)) {
      return extrasCache[productId];
    }

    const { token } = getCurrentSession();
    if (!token) {
      return null;
    }

    try {
      const response = await fetch(new URL(`extras/product/${productId}`, API_BASE_URL).toString(), {
        headers: {
          "Content-Type": "application/json",
          token,
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("No se pudieron cargar extras.");
      }

      const data = (await response.json().catch(() => null)) as { COLOR?: unknown; TALLA?: unknown } | null;
      const normalized: ProductExtrasVm = {
        COLOR: Array.isArray(data?.COLOR)
          ? data.COLOR
            .map((item) => ({
              id: Number((item as { Id?: number }).Id),
              description: String((item as { Description?: string }).Description ?? "").trim(),
            }))
            .filter((item) => Number.isFinite(item.id) && item.id > 0 && item.description.length > 0)
          : [],
        TALLA: Array.isArray(data?.TALLA)
          ? data.TALLA
            .map((item) => ({
              id: Number((item as { Id?: number }).Id),
              description: String((item as { Description?: string }).Description ?? "").trim(),
            }))
            .filter((item) => Number.isFinite(item.id) && item.id > 0 && item.description.length > 0)
          : [],
      };

      const sanitized = normalized.COLOR.length || normalized.TALLA.length ? normalized : null;
      setExtrasCache((current) => ({ ...current, [productId]: sanitized }));
      return sanitized;
    } catch {
      setExtrasCache((current) => ({ ...current, [productId]: null }));
      return null;
    }
  };

  const loadProductVariants = async (product: SaleItemVm): Promise<SaleVariantVm[]> => {
    if (Object.prototype.hasOwnProperty.call(variantsCache, product.id)) {
      return variantsCache[product.id];
    }

    const { token } = getCurrentSession();
    if (!token) {
      return product.variants;
    }

    try {
      const response = await fetch(new URL(`variants/product/${product.id}`, API_BASE_URL).toString(), {
        headers: {
          "Content-Type": "application/json",
          token,
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("No se pudieron cargar variantes.");
      }

      const payload = (await response.json().catch(() => [])) as VariantApiResponse[] | null;
      const normalized = Array.isArray(payload)
        ? payload.map((variant) => ({
          id: typeof variant.Id === "number" && Number.isFinite(variant.Id) ? variant.Id : null,
          description: (variant.Description ?? "").trim() || "Variante",
          color: variant.Color?.trim() || null,
          size: variant.Size?.trim() || variant.Talla?.trim() || null,
          price: typeof variant.PromotionPrice === "number" && variant.PromotionPrice > 0
            ? variant.PromotionPrice
            : typeof variant.Price === "number" && Number.isFinite(variant.Price)
              ? variant.Price
              : product.price,
          stock: typeof variant.Stock === "number" && Number.isFinite(variant.Stock) ? variant.Stock : null,
        }))
        : [];

      const resolved = normalized.length > 0 ? normalized : product.variants;
      setVariantsCache((current) => ({ ...current, [product.id]: resolved }));
      return resolved;
    } catch {
      setVariantsCache((current) => ({ ...current, [product.id]: product.variants }));
      return product.variants;
    }
  };

  const addToCartEntry = (
    product: SaleItemVm,
    variant: SaleVariantVm | null,
    quantity = 1,
    colorOption?: ProductExtraOptionVm | null,
    sizeOption?: ProductExtraOptionVm | null,
  ) => {
    const cartKey = toCartKey(product.id, variant?.id ?? null, colorOption?.id ?? null, sizeOption?.id ?? null);
    const basePrice = variant?.price ?? product.price;
    const variantLabel = variant ? toVariantLabel(variant) : null;
    const resolvedColorLabel = colorOption?.description ?? variant?.color ?? product.color ?? null;
    const normalizedQuantity = Math.max(1, Math.floor(quantity));
    const itemName = product.name;

    setCart((current) => {
      const existing = current[cartKey];
      return {
        ...current,
        [cartKey]: {
          cartKey,
          productId: product.id,
          name: itemName,
          price: basePrice,
          quantity: (existing?.quantity ?? 0) + normalizedQuantity,
          variantId: variant?.id ?? null,
          variantLabel,
          colorId: colorOption?.id ?? null,
          sizeId: sizeOption?.id ?? null,
          colorLabel: resolvedColorLabel,
          sizeLabel: sizeOption?.description ?? null,
        },
      };
    });
    setUiMessage(`${itemName} agregado al carrito.`);
    setValidationError(null);
    setVariantModalError(null);
  };

  const addToCart = async (product: SaleItemVm) => {
    const variants = await loadProductVariants(product);
    const extras = await loadProductExtras(product.id);
    const hasExtraSize = (extras?.TALLA.length ?? 0) > 0;
    const hasBaseStock = product.stock === null || product.stock > 0;
    const hasVariants = variants.length > 0;

    if (!hasVariants && !hasExtraSize) {
      addToCartEntry(product, null);
      return;
    }

    const availableVariants = variants.filter((variant) => (variant.stock === null || variant.stock > 0) && variant.id !== null);
    if (!availableVariants.length && !hasBaseStock) {
      setValidationError("Este producto no tiene stock disponible ni en base ni en variantes.");
      return;
    }

    const modalVariants = hasBaseStock
      ? [
        {
          id: null,
          description: product.name,
          color: product.color ?? null,
          size: null,
          price: product.price,
          stock: product.stock,
        },
        ...availableVariants,
      ]
      : availableVariants;

    if (modalVariants.length === 1 && !hasExtraSize) {
      addToCartEntry(product, modalVariants[0].id === null ? null : modalVariants[0]);
      return;
    }

    setVariantSelection({
      product,
      variants: modalVariants,
      extras,
      selectedVariantKey: modalVariants[0] ? toCartKey(product.id, modalVariants[0].id) : null,
      selectedSizeId: null,
      quantities: modalVariants.reduce<Record<string, number>>((accumulator, variant) => {
        accumulator[toCartKey(product.id, variant.id)] = 1;
        return accumulator;
      }, {}),
    });
    setVariantModalError(null);
  };

  const setQuantity = (cartKey: string, quantity: number) => {
    const safeQuantity = Number.isNaN(quantity) ? 0 : Math.max(0, Math.floor(quantity));

    setCart((current) => {
      const target = current[cartKey];
      if (!target) return current;
      if (safeQuantity <= 0) {
        const { [cartKey]: _, ...rest } = current;
        return rest;
      }

      return {
        ...current,
        [cartKey]: {
          ...target,
          quantity: safeQuantity,
        },
      };
    });
  };

  const updateQuantity = (cartKey: string, delta: number) => {
    setCart((current) => {
      const target = current[cartKey];
      if (!target) return current;

      const nextQuantity = target.quantity + delta;
      if (nextQuantity <= 0) {
        const { [cartKey]: _, ...rest } = current;
        return rest;
      }

      return {
        ...current,
        [cartKey]: {
          ...target,
          quantity: nextQuantity,
        },
      };
    });
  };

  const confirmVariantSelection = () => {
    if (!variantSelection) return;
    const variant = variantSelection.selectedVariantKey
      ? variantSelection.variants.find((item) => toCartKey(variantSelection.product.id, item.id) === variantSelection.selectedVariantKey) ?? null
      : null;

    const selectedSize = variantSelection.extras?.TALLA.find((option) => option.id === variantSelection.selectedSizeId) ?? null;

    const needsSize = (variantSelection.extras?.TALLA.length ?? 0) > 0;
    if (needsSize && !selectedSize) {
      setVariantModalError("Debes seleccionar los campos obligatorios antes de agregar.");
      return;
    }

    const selectedKey = variantSelection.selectedVariantKey ?? "";
    const quantity = Math.max(1, Math.floor(variantSelection.quantities[selectedKey] ?? 1));
    addToCartEntry(variantSelection.product, variant, quantity, null, selectedSize);
    setVariantSelection(null);
    setValidationError(null);
    setVariantModalError(null);
  };

  const discountValue = Number(discountPercent);
  const scrollToProductsTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goToPage = () => {
    const target = Number(pageInput);
    if (!Number.isFinite(target)) return;
    const normalized = Math.min(Math.max(1, Math.floor(target)), totalPages);
    if (normalized === currentPage) return;
    setCurrentPage(normalized);
    scrollToProductsTop();
  };

  const resolveEmployeeId = (token: string): number => {
    const fromStorage = Number(window.localStorage.getItem(EMPLOYEE_ID_KEY));
    if (Number.isFinite(fromStorage) && fromStorage > 0) {
      return fromStorage;
    }

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const decodedCandidate = decoded.employeeId ?? decoded.Employee_Id ?? decoded.Id ?? decoded.id ?? decoded.sub;
      const parsedDecoded = Number(decodedCandidate);
      if (Number.isFinite(parsedDecoded) && parsedDecoded > 0) {
        window.localStorage.setItem(EMPLOYEE_ID_KEY, String(parsedDecoded));
        debugLog("Employee_Id recuperado desde JWT.", parsedDecoded);
        return parsedDecoded;
      }
    } catch (error) {
      debugLog("No se pudo decodificar JWT para Employee_Id.", error);
    }

    return 0;
  };

  const handleCompleteSale = async () => {
    if (!totals.items) {
      setValidationError("Agrega productos antes de finalizar la venta.");
      return;
    }

    if (Number.isNaN(discountValue) || discountValue < 0 || discountValue > 100) {
      setValidationError("El descuento debe estar entre 0 y 100.");
      return;
    }

    const { token } = getCurrentSession();
    const employeeId = token ? resolveEmployeeId(token) : 0;

    if (!token || !employeeId) {
      debugLog("Fallo de sesión al finalizar venta.", {
        hasToken: Boolean(token),
        storedEmployeeId: window.localStorage.getItem(EMPLOYEE_ID_KEY),
      });
      setValidationError("No encontramos la sesión del empleado. Inicia sesión nuevamente para finalizar.");
      return;
    }

    const lineItems = cartItems.map((item) => ({
      Product_Id: item.productId,
      Quantity: item.quantity,
      Price: item.price,
      Cost: 0,
      Variant_Id: item.variantId ?? undefined,
      Color_Id: item.colorId ?? undefined,
      Size_Id: item.sizeId ?? undefined,
    }));

    const payloadByTable = {
      Employee_Id: employeeId,
      Customer_Id: selectedCustomerId ? Number(selectedCustomerId) : undefined,
      PaymentMethod: paymentMethod,
      Total: totals.total,
      Discount: discountValue,
      Tax: Boolean(salesTax && applyTax),
    };

    setIsCompletingSale(true);
    setValidationError(null);
    debugLog("Intentando finalizar venta.", {
      endpoint: selectedTableId ? "commands" : "orders",
      selectedTable: selectedTableName,
      employeeId,
      items: lineItems,
      total: totals.total,
      paymentMethod,
    });

    try {
      const endpoint = selectedTableId ? "commands" : "orders";
      const payload = selectedTableId
        ? {
          Command: {
            ...payloadByTable,
            Table_Id: Number(selectedTableId),
          },
          Commands_has_Products: lineItems,
        }
        : {
          Order: payloadByTable,
          OrderDetails: lineItems,
        };

      const response = await fetch(new URL(endpoint, API_BASE_URL).toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = (await response.json().catch(() => null)) as { message?: string; Id?: number } | null;

      if (!response.ok) {
        throw new Error(responseData?.message ?? "No pudimos registrar la venta en la base de datos.");
      }
      debugLog("Venta registrada correctamente.", responseData);

      const folio = `RVK-${Date.now().toString().slice(-6)}`;
      const paymentMethodLabel = PAYMENT_METHOD_OPTIONS.find((option) => option.value === paymentMethod)?.label ?? paymentMethod;
      const printableItems: CompletedSaleLine[] = cartItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        lineTotal: item.price * item.quantity,
      }));

      setTicket(`Venta ${folio} · ${paymentMethodLabel} · ${selectedTableName} · Total $${totals.total.toFixed(2)}`);
      setCompletedSale({
        folio,
        paymentMethodLabel,
        table: selectedTableName,
        total: totals.total,
        customerName: customers.find((customer) => String(customer.id) === selectedCustomerId)?.name,
        createdAt: new Date().toISOString(),
        items: printableItems,
      });
      setCart({});
      setDiscountPercent("0");
      setMobileStep("catalog");
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : "No pudimos registrar la venta en la base de datos.");
    } finally {
      setIsCompletingSale(false);
    }
  };

  const hasPrintableSaleData = (sale: CompletedSale): boolean => {
    const hasFolio = sale.folio.trim().length > 0;
    const hasTotal = Number.isFinite(sale.total) && sale.total > 0;
    const hasItems = Array.isArray(sale.items) && sale.items.length > 0;
    return hasFolio && hasTotal && hasItems;
  };

  const handlePrintSaleTicket = (sale: CompletedSale) => {
    if (!hasPrintableSaleData(sale)) {
      setValidationError("La venta no tiene datos suficientes para imprimir ticket (folio, items y total).");
      return;
    }

    const configuredPrinters = readPosPrinters();
    const defaultPrinter = getDefaultPosPrinter(configuredPrinters);
    const resolvedPaper = defaultPrinter?.paperMm ?? "80";
    if (!defaultPrinter) {
      setUiMessage("No hay impresora predeterminada registrada. Se usa formato estándar de 80 mm para imprimir.");
    }

    const pageWidth = `${resolvedPaper}mm`;
    const printableLines = sale.items
      .map((item) => `<li><span>${item.name} x${item.quantity}</span><strong>$${item.lineTotal.toFixed(2)}</strong></li>`)
      .join("");
    const storeName = quoteBusinessName.trim() || "Mi negocio";
    const saleDate = new Date(sale.createdAt);
    const safeSaleDate = Number.isNaN(saleDate.getTime()) ? new Date() : saleDate;
    const saleDateLabel = safeSaleDate.toLocaleDateString("es-MX");
    const saleTimeLabel = safeSaleDate.toLocaleTimeString("es-MX");
    const printDate = new Date();

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Ticket ${sale.folio}</title>
    <style>
      @page { size: ${resolvedPaper}mm auto; margin: 3mm; }
      * { box-sizing: border-box; }
      body { margin: 0; font-family: Inter, Arial, sans-serif; color: #111827; background: #f8fafc; }
      .preview-actions { position: sticky; top: 0; z-index: 2; display: flex; justify-content: center; padding: 8px; background: #111827; }
      .preview-actions button { border: 0; border-radius: 999px; padding: 8px 14px; font-size: 12px; font-weight: 700; cursor: pointer; background: #22c55e; color: #052e16; }
      .ticket { width: ${pageWidth}; padding: 2mm; margin: 8px auto; background: #fff; }
      h1 { margin: 0 0 2mm; font-size: 14px; text-align: center; }
      p { margin: 0 0 1.4mm; font-size: 11px; }
      ul { list-style: none; margin: 2mm 0; padding: 0; display: grid; gap: 1mm; }
      li { display: flex; justify-content: space-between; gap: 3mm; border-bottom: 1px dashed #d1d5db; padding-bottom: 1mm; font-size: 11px; }
      .total { font-size: 12px; font-weight: 700; margin-top: 1.6mm; }
      .meta { font-size: 10px; color: #4b5563; }
      @media print {
        body { background: #fff; }
        .preview-actions { display: none; }
        .ticket { margin: 0 auto; }
      }
    </style>
  </head>
  <body>
    <div class="preview-actions"><button type="button" onclick="window.print()">Imprimir ticket</button></div>
    <section class="ticket">
      <h1>Ticket de venta</h1>
      <p><strong>Tienda:</strong> ${storeName}</p>
      <p><strong>Folio:</strong> ${sale.folio}</p>
      <p><strong>Fecha:</strong> ${saleDateLabel}</p>
      <p><strong>Hora:</strong> ${saleTimeLabel}</p>
      <p><strong>Impresión:</strong> ${printDate.toLocaleString("es-MX")}</p>
      <p><strong>Mesa:</strong> ${sale.table}</p>
      <p><strong>Método:</strong> ${sale.paymentMethodLabel}</p>
      <p><strong>Cliente:</strong> ${sale.customerName ?? "General"}</p>
      <ul>${printableLines}</ul>
      <p class="total">Total: $${sale.total.toFixed(2)}</p>
    </section>
  </body>
</html>`;

    const opened = printHtmlDocument(`Ticket ${sale.folio}`, html);
    if (!opened) {
      setValidationError("No pudimos abrir la ventana de impresión. Verifica permisos del navegador.");
    }
  };

  const handleGenerateQuotePdf = () => {
    if (!quoteClientName.trim()) {
      setValidationError("Agrega el nombre del cliente para generar la cotización.");
      return;
    }
    if (cartItems.length === 0) {
      setValidationError("Agrega productos al carrito para generar la cotización.");
      return;
    }

    const quoteNumber = `COT-${Date.now().toString().slice(-6)}`;
    const subtotal = totals.subtotal;
    const tax = totals.taxAmount;
    const total = totals.total;
    const rows = cartItems
      .map((item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>$${item.price.toFixed(2)}</td>
          <td>$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `)
      .join("");
    const logoMarkup = quoteLogoUrl.trim()
      ? `<img src="${quoteLogoUrl.trim()}" alt="Logo negocio" style="max-height:68px;max-width:160px;object-fit:contain;" />`
      : `<div style="font-weight:700;font-size:14px;">${quoteBusinessName.trim() || "Mi negocio"}</div>`;

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Cotización ${quoteNumber}</title>
    <style>
      @page { size: A4; margin: 12mm; }
      body { margin: 0; font-family: Inter, Arial, sans-serif; color: #111827; }
      .quote { width: 100%; }
      .head { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 14px; }
      h1 { margin: 0; font-size: 22px; }
      p { margin: 3px 0; font-size: 12px; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th, td { border: 1px solid #e5e7eb; padding: 7px; font-size: 12px; text-align: left; }
      th { background: #f8fafc; }
      .num { text-align: right; }
      .summary { margin-top: 12px; margin-left: auto; width: min(100%, 320px); }
      .summary p { display: flex; justify-content: space-between; }
      .summary .total { font-size: 16px; font-weight: 800; }
      .foot { margin-top: 16px; font-size: 11px; color: #6b7280; }
    </style>
  </head>
  <body>
    <section class="quote">
      <div class="head">
        <div>${logoMarkup}</div>
        <div>
          <h1>Cotización</h1>
          <p><strong>Folio:</strong> ${quoteNumber}</p>
          <p><strong>Cliente:</strong> ${quoteClientName.trim()}</p>
          <p><strong>Emisión:</strong> ${quoteIssueDate}</p>
          <p><strong>Vigencia:</strong> ${quoteValidUntil}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio unitario</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div class="summary">
        <p><span>Subtotal</span><strong>$${subtotal.toFixed(2)}</strong></p>
        <p><span>Impuesto</span><strong>$${tax.toFixed(2)}</strong></p>
        <p class="total"><span>Total</span><strong>$${total.toFixed(2)}</strong></p>
      </div>

      <p class="foot">Esta cotización respeta precios hasta la fecha de vigencia indicada.</p>
    </section>
  </body>
</html>`;

    const opened = printHtmlDocument(`Cotización ${quoteNumber}`, html);
    if (!opened) {
      setValidationError("No pudimos abrir la ventana para generar PDF de cotización.");
      return;
    }
    setUiMessage(`Cotización ${quoteNumber} lista. En la ventana de impresión selecciona “Guardar como PDF”.`);
  };

  return (
    <PosV2Shell title="Ravekh">
      <section className="pos-v2-sales-home pos-v2-sales-layout">
        <div className="pos-v2-sales-home__mobile-steps" role="tablist" aria-label="Flujo de venta">
          {mobileSteps.map(({ key, label, helper, Icon }) => {
            const active = mobileStep === key;

            return (
              <button
                key={key}
                type="button"
                className={active ? "is-active" : ""}
                onClick={() => setMobileStep(key)}
                aria-current={active ? "step" : undefined}
              >
                <span className="pos-v2-sales-home__mobile-step-icon" aria-hidden="true">
                  <Icon active={active} />
                </span>
                <span className="pos-v2-sales-home__mobile-step-label">{label}</span>
                {helper ? <small>{helper}</small> : null}
              </button>
            );
          })}
        </div>

        <section className={`pos-v2-sales-home__catalog ${mobileStep === "catalog" ? "is-mobile-active" : ""}`}>


          <div className="pos-v2-sales-home__toolbar">
            <div className="pos-v2-sales-home__toolbar-actions">
              <button type="button" className="pos-v2-sales-home__back-main" onClick={() => navigate(-1)}>← Regresar</button>
            </div>

            <div className="pos-v2-sales-home__search">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar producto"
              />
            </div>

            <div className="pos-v2-sales-home__view-switch" role="group" aria-label="Tipo de vista">
              <button type="button" className={isGrid ? "is-active" : ""} onClick={() => setIsGrid(true)}>
                Grid
              </button>
              <button type="button" className={!isGrid ? "is-active" : ""} onClick={() => setIsGrid(false)}>
                Lista
              </button>
            </div>
          </div>

        

          <div className="pos-v2-sales-home__categories">
            {categoryOptions.map((item) => {
              const active = item.key === categoryKey;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setCategoryKey(item.key)}
                  className={active ? "is-active" : ""}
                  aria-current={active ? "true" : undefined}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {loadingProducts ? <p className="pos-v2-sales-home__empty">Cargando productos…</p> : null}
          {productsError ? <p className="pos-v2-sales-home__error">{productsError}</p> : null}
          <div className={`pos-v2-sales-home__products ${isGrid ? "is-grid" : "is-list"}`}>
            {filteredProducts.map((product) => {
              const sellableVariants = product.variants.filter((variant) => variant.stock === null || variant.stock > 0);
              const hasBaseStock = product.stock === null || product.stock > 0;
              const hasBlockedVariants = !hasBaseStock && product.variants.length > 0 && sellableVariants.length === 0;

              return (
                <article
                  key={product.id}
                  className={`pos-v2-sales-home__product-card ${!isGrid ? "is-list-item" : ""}`}
                >
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="pos-v2-sales-home__product-image" />
                  ) : (
                    <div className="pos-v2-sales-home__product-image-placeholder" aria-hidden="true">
                      {product.name.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="pos-v2-sales-home__product-content">
                    <p className="pos-v2-sales-home__product-category">{product.category}</p>
                    <h3>{product.name}</h3>
                    {product.variants.length > 0 ? (
                      <small className="pos-v2-sales-home__variant-badge">
                        {sellableVariants.length}/{product.variants.length} variantes disponibles
                      </small>
                    ) : null}
                  </div>
                  <div className="pos-v2-sales-home__product-side">
                    <strong>${product.price.toFixed(2)}</strong>
                    <button type="button" onClick={() => void addToCart(product)} disabled={hasBlockedVariants}>
                      {product.variants.length > 0 ? "Elegir variante" : "Agregar"}
                    </button>
                  </div>
                </article>
              );
            })}

            {!loadingProducts && !productsError && filteredProducts.length === 0 ? (
              <p className="pos-v2-sales-home__empty">No encontramos productos para esta categoría.</p>
            ) : null}
          </div>

          {!loadingProducts && !productsError && totalPages > 1 ? (
            <nav className="pos-v2-sales-home__pagination" aria-label="Paginación de productos">
              <button
                type="button"
                onClick={() => {
                  setCurrentPage((page) => Math.max(1, page - 1));
                  scrollToProductsTop();
                }}
                disabled={!hasPrevPage}
              >
                Anterior
              </button>
              <span>Página {currentPage} de {totalPages}</span>
              <label className="pos-v2-sales-home__pagination-goto">
                Ir a
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={pageInput}
                  onChange={(event) => setPageInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      goToPage();
                    }
                  }}
                />
                <button type="button" onClick={goToPage}>Ir</button>
              </label>
              <button
                type="button"
                onClick={() => {
                  setCurrentPage((page) => page + 1);
                  scrollToProductsTop();
                }}
                disabled={!hasNextPage}
              >
                Siguiente
              </button>
            </nav>
          ) : null}
        </section>

        <aside className={`pos-v2-sales-home__cart-panel ${mobileStep === "cart" || mobileStep === "checkout" ? "is-mobile-active" : ""}`}>
          
          <div className={`pos-v2-sales-home__cart-content ${mobileStep === "cart" ? "is-mobile-active" : ""}`}>
            <div className="pos-v2-sales-home__cart-mobile-actions">
              <button type="button" className="pos-v2-sales-home__back" onClick={() => setMobileStep("catalog")}>
                Regresar
              </button>
            </div>

            <h2>Mesa · {selectedTableName}</h2>

            {cartItems.length === 0 ? <p className="pos-v2-sales-home__empty">No hay productos agregados.</p> : null}

            {cartItems.length > 0 ? (
              <ul className="pos-v2-sales-home__cart-list">
                {cartItems.map((item) => (
                  <li key={item.cartKey}>
                    <div>
                      <p>{item.name}</p>
                      <small>
                        {[
                          item.variantLabel,
                          item.colorLabel ? `Color ${item.colorLabel}` : null,
                          item.sizeLabel ? `Talla ${item.sizeLabel}` : null,
                        ].filter(Boolean).join(" · ") || "Sin variante"}
                      </small>
                    </div>
                    <div className="pos-v2-sales-home__qty-controls">
                      <button
                        type="button"
                        className="is-danger flex items-center justify-center"
                        onClick={() => updateQuantity(item.cartKey, -1)}
                        aria-label={item.quantity > 1 ? `Quitar una pieza de ${item.name}` : `Eliminar ${item.name} del carrito`}
                      >
                        {item.quantity > 1 ? "-1" : <FiTrash2 size={14} color="#b91c1c" />}
                      </button>
                      <input
                        type="number"
                        min="0"
                        className="flex items-center justify-center"
                        value={item.quantity}
                        onChange={(event) => setQuantity(item.cartKey, Number(event.target.value))}
                        aria-label={`Cantidad de ${item.name}`}
                      />
                      <button type="button" onClick={() => updateQuantity(item.cartKey, 1)}>+1</button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="pos-v2-sales-home__totals">
              <p><span>Subtotal</span><strong>${totals.subtotal.toFixed(2)}</strong></p>
              <p><span>Descuento</span><strong>-${totals.discount.toFixed(2)}</strong></p>
              {salesTax && applyTax ? (
                <p><span>{salesTax.description}</span><strong>${totals.taxAmount.toFixed(2)}</strong></p>
              ) : null}
              <p className="is-total"><span>Total</span><strong>${totals.total.toFixed(2)}</strong></p>
            </div>

            <button
              type="button"
              className="pos-v2-sales-home__continue"
              onClick={() => setMobileStep("checkout")}
              disabled={!totals.items}
            >
              Continuar a cobro
            </button>
          </div>

          <div className={`pos-v2-sales-home__checkout pos-v2-sales-home__checkout-content ${mobileStep === "checkout" ? "is-mobile-active" : ""}`}>
            <h3>Cobro</h3>
            <label>
              Descuento (%)
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(event) => {
                  setDiscountPercent(event.target.value);
                  setValidationError(null);
                }}
              />
            </label>

            <div className="pos-v2-sales-home__payment-methods" role="radiogroup" aria-label="Selecciona método de pago">
              {PAYMENT_METHOD_OPTIONS.map(({ value, label, Icon }) => {
                const isActive = paymentMethod === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    className={isActive ? "is-active" : ""}
                    onClick={() => setPaymentMethod(value)}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                );
              })}
            </div>

            <label>
              Zona de mesas
              <select value={selectedTableZoneId} onChange={(event) => setSelectedTableZoneId(event.target.value)} disabled={loadingTables}>
                {tableZones.length === 0 ? <option value="">Sin zonas activas</option> : tableZones.map((zone) => (
                  <option key={zone.id} value={zone.id}>{zone.name}</option>
                ))}
              </select>
            </label>

            <label>
              Mesa
              <select value={selectedTableId} onChange={(event) => setSelectedTableId(event.target.value)} disabled={loadingTables || !selectedTableZoneId}>
                <option value="">Sin mesa (orden directa)</option>
                {visibleTables.map((table) => (
                  <option key={table.id} value={table.id}>{table.name}</option>
                ))}
              </select>
            </label>

            {hasCustomers ? (
              <label>
                Cliente (opcional)
                <select value={selectedCustomerId} onChange={(event) => setSelectedCustomerId(event.target.value)}>
                  <option value="">Venta general</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </select>
              </label>
            ) : null}
            {!customersError && hasCustomers ? <small className="pos-v2-sales-home__customer-hint">Puedes vincular la venta a cliente para historial y recompensas.</small> : null}
            {salesTax ? (
              <section className="pos-v2-sales-home__tax-card" aria-label="Impuesto de venta">
                <div>
                  <strong>{salesTax.description}</strong>
                  <small>{salesTax.isPercent ? `${salesTax.value}%` : `$${salesTax.value.toFixed(2)}`}</small>
                </div>
                {salesTax.canBeRemovedAtSale ? (
                  <label className="pos-v2-sales-home__tax-toggle">
                    <span>Aplicar impuesto</span>
                    <span className="pos-v2-sales-home__toggle">
                      <input type="checkbox" checked={applyTax} onChange={(event) => setApplyTax(event.target.checked)} />
                      <span className="pos-v2-sales-home__toggle-slider" aria-hidden="true" />
                    </span>
                  </label>
                ) : (
                  <span className="pos-v2-sales-home__tax-lock">Impuesto obligatorio</span>
                )}
              </section>
            ) : null}
            {taxError ? <small className="pos-v2-sales-home__tax-error">{taxError}</small> : null}

            <div className="pos-v2-sales-home__totals">
              <p><span>Subtotal</span><strong>${totals.subtotal.toFixed(2)}</strong></p>
              <p><span>Descuento</span><strong>-${totals.discount.toFixed(2)}</strong></p>
              {salesTax && applyTax ? (
                <p><span>{salesTax.description}</span><strong>${totals.taxAmount.toFixed(2)}</strong></p>
              ) : null}
              <p className="is-total"><span>Total</span><strong>${totals.total.toFixed(2)}</strong></p>
            </div>

            <div className="pos-v2-sales-home__checkout-actions">
              <button
                type="button"
                className="pos-v2-sales-home__complete"
                onClick={handleCompleteSale}
                disabled={!totals.items || isCompletingSale}
              >
                {isCompletingSale ? "Finalizando..." : "Finalizar venta"}
              </button>

              <button type="button" className="pos-v2-sales-home__back" onClick={() => setMobileStep("cart")}>
                Regresar al carrito
              </button>
            </div>

            <section className="pos-v2-sales-home__quote-card" aria-label="Generador de cotización">
              <h4>Cotización (PDF)</h4>
              <label>
                Nombre del cliente
                <input value={quoteClientName} onChange={(event) => setQuoteClientName(event.target.value)} placeholder="Ej. María López" />
              </label>
              <small className="pos-v2-sales-home__customer-hint">
                Negocio: <strong>{quoteBusinessName || "Mi negocio"}</strong>{quoteLogoUrl ? " · Logo cargado" : " · Sin logo configurado"}
              </small>
              <div className="pos-v2-sales-home__quote-dates">
                <label>
                  Fecha de emisión
                  <input type="date" value={quoteIssueDate} onChange={(event) => setQuoteIssueDate(event.target.value)} />
                </label>
                <label>
                  Vigencia de cotización
                  <input type="date" value={quoteValidUntil} onChange={(event) => setQuoteValidUntil(event.target.value)} />
                </label>
              </div>
              <button type="button" className="pos-v2-sales-home__quote-btn" onClick={handleGenerateQuotePdf} disabled={cartItems.length === 0}>
                Generar cotización PDF
              </button>
            </section>

            {validationError ? <p className="pos-v2-sales-home__error">{validationError}</p> : null}
            {ticket ? <p className="pos-v2-sales-home__ticket">{ticket}</p> : null}
          </div>
        </aside>
      </section>

      {uiMessage ? <p className="pos-v2-sales-home__info" role="status" aria-live="polite">{uiMessage}</p> : null}

      {variantSelection ? (
        <section className="pos-v2-sales-home__variant-modal" role="dialog" aria-modal="true" aria-label="Seleccionar variante" onClick={() => setVariantSelection(null)}>
          <article className="pos-v2-sales-home__variant-modal-card" onClick={(event) => event.stopPropagation()}>
            <header>
              <h3>{variantSelection.product.name}</h3>
              <p>Selecciona variante y extras para enviar la venta con el detalle correcto.</p>
            </header>

            <div className="pos-v2-sales-home__variant-summary">
              <span>{variantSelection.variants.length} opciones de variante</span>
              <span>El color se toma del producto/variante</span>
              <span>{(variantSelection.extras?.TALLA.length ?? 0) > 0 ? "Talla requerida" : "Sin talla obligatoria"}</span>
            </div>

            {variantSelection.extras ? (
              <div className="pos-v2-sales-home__variant-filters">
                {variantSelection.extras.TALLA.length > 0 ? (
                  <label>
                    Talla
                    <select
                      value={variantSelection.selectedSizeId ?? ""}
                      onChange={(event) => {
                        const value = event.target.value ? Number(event.target.value) : null;
                        setVariantSelection((current) => (current ? { ...current, selectedSizeId: value } : null));
                        setVariantModalError(null);
                      }}
                    >
                      <option value="">Selecciona talla</option>
                      {variantSelection.extras.TALLA.map((size) => (
                        <option key={size.id} value={size.id}>{size.description}</option>
                      ))}
                    </select>
                  </label>
                ) : null}
              </div>
            ) : null}

            <p className="pos-v2-sales-home__variant-section-label">Variantes disponibles</p>
            <div className="pos-v2-sales-home__variant-options" role="radiogroup" aria-label="Variantes disponibles">
              {variantSelection.variants.length > 0 ? variantSelection.variants
                .map((variant) => {
                  const optionKey = toCartKey(variantSelection.product.id, variant.id);
                  const isActive = optionKey === variantSelection.selectedVariantKey;
                  const quantity = Math.max(1, Math.floor(variantSelection.quantities[optionKey] ?? 1));
                  const chips = [variant.color, variant.size].filter(Boolean).join(" · ");
                  const stockLabel = variant.stock == null ? "Stock abierto" : `Stock ${variant.stock}`;

                  return (
                    <label
                      key={optionKey}
                      className={`pos-v2-sales-home__variant-option ${isActive ? "is-active" : ""}`}
                    >
                      <input
                        type="radio"
                        name="variant-selection"
                        checked={isActive}
                        onChange={() => {
                          if (isActive) return;
                          setVariantSelection((current) => (current ? { ...current, selectedVariantKey: optionKey } : null));
                          setVariantModalError(null);
                        }}
                        aria-label={`Seleccionar variante ${variant.description || "Variante"}`}
                      />
                      <button
                        type="button"
                        className={isActive ? "is-active" : ""}
                        onClick={() => {
                          if (isActive) return;
                          setVariantSelection((current) => (current ? { ...current, selectedVariantKey: optionKey } : null));
                          setVariantModalError(null);
                        }}
                      >
                        <strong>{variant.description || "Variante"}</strong>
                        <small>{chips || "Sin atributos adicionales"}</small>
                        <small>{stockLabel}</small>
                        <span>${variant.price.toFixed(2)}</span>
                      </button>
                      <div className="pos-v2-sales-home__variant-row-qty" aria-label={`Cantidad para ${variant.description || "variante"}`}>
                        <button
                          type="button"
                          className="is-secondary"
                          onClick={() => {
                            setVariantSelection((current) => {
                              if (!current) return null;
                              const currentQty = Math.max(1, Math.floor(current.quantities[optionKey] ?? 1));
                              return {
                                ...current,
                                selectedVariantKey: optionKey,
                                quantities: {
                                  ...current.quantities,
                                  [optionKey]: Math.max(1, currentQty - 1),
                                },
                              };
                            });
                          }}
                        >
                          -1
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(event) => {
                            const value = Number(event.target.value);
                            setVariantSelection((current) => {
                              if (!current) return null;
                              return {
                                ...current,
                                selectedVariantKey: optionKey,
                                quantities: {
                                  ...current.quantities,
                                  [optionKey]: Number.isFinite(value) && value > 0 ? Math.floor(value) : 1,
                                },
                              };
                            });
                          }}
                        />
                        <button
                          type="button"
                          className="is-secondary"
                          onClick={() => {
                            setVariantSelection((current) => {
                              if (!current) return null;
                              const currentQty = Math.max(1, Math.floor(current.quantities[optionKey] ?? 1));
                              return {
                                ...current,
                                selectedVariantKey: optionKey,
                                quantities: {
                                  ...current.quantities,
                                  [optionKey]: currentQty + 1,
                                },
                              };
                            });
                          }}
                        >
                          +1
                        </button>
                      </div>
                    </label>
                  );
                }) : <p className="pos-v2-sales-home__empty">Sin variantes: se agregará el producto base.</p>}
            </div>

            <p className="pos-v2-sales-home__variant-selected">
              Variante elegida: <strong>
                {variantSelection.variants.find((item) => toCartKey(variantSelection.product.id, item.id) === variantSelection.selectedVariantKey)?.description ?? "Sin seleccionar"}
              </strong>
            </p>

            <footer>
              <button type="button" className="is-secondary" onClick={() => setVariantSelection(null)}>Cancelar</button>
              <button
                type="button"
                onClick={confirmVariantSelection}
                disabled={variantSelection.variants.length > 0 && !variantSelection.selectedVariantKey}
              >
                Confirmar y agregar
              </button>
            </footer>
            {variantModalError ? <p className="pos-v2-sales-home__error">{variantModalError}</p> : null}
          </article>
        </section>
      ) : null}

      {totals.items > 0 ? (
        <button type="button" className="pos-v2-sales-home__mobile-order-resume" onClick={() => setMobileStep("cart")}>
          <span>{totals.items} prod.</span>
          <strong>${totals.total.toFixed(2)}</strong>
          <em>Ver mesa</em>
        </button>
      ) : null}

      {hasTableSelection ? (
        <div className="pos-v2-sales-home__tables-bar" aria-label="Barra de mesas">
          {loadingTables ? (
            <div className="pos-v2-sales-home__tables-skeleton" aria-hidden="true">
              {Array.from({ length: 4 }).map((_, index) => <span key={`tables-skeleton-${index}`} />)}
            </div>
          ) : (
            <>
              <button
                type="button"
                className={!selectedTableId ? "is-active" : ""}
                onClick={() => setSelectedTableId("")}
              >
                Sin mesa
              </button>
              {visibleTables.map((table) => {
                const isActive = String(table.id) === selectedTableId;
                const isOccupied = isActive && totals.items > 0;

                return (
                  <button
                    key={table.id}
                    type="button"
                    className={`${isActive ? "is-active" : ""} ${isOccupied ? "is-occupied" : ""}`.trim()}
                    onClick={() => setSelectedTableId(String(table.id))}
                  >
                    {table.name}
                  </button>
                );
              })}
            </>
          )}
        </div>
      ) : null}

      <div className="pos-v2-sales-home__mobile-summary-dock">
        {hasTableSelection ? <button type="button" onClick={() => setIsMobileTablesOpen(true)}>Mesas</button> : null}
        <button type="button" className="is-summary" onClick={() => setMobileStep("cart")}>
          {totals.items.toFixed(2)}x Items = ${totals.total.toFixed(2)}
        </button>
      </div>

      {isMobileTablesOpen && hasTableSelection ? (
        <div className="pos-v2-sales-home__tables-modal" role="dialog" aria-modal="true" aria-label="Seleccionar mesa">
          <div className="pos-v2-sales-home__tables-modal-card">
            <div className="pos-v2-sales-home__tables-modal-header">
              <h3>Selecciona mesa</h3>
              <button type="button" onClick={() => setIsMobileTablesOpen(false)}>Cerrar</button>
            </div>

            <div className="pos-v2-sales-home__tables-modal-grid">
              {loadingTables ? (
                <div className="pos-v2-sales-home__tables-skeleton" aria-hidden="true">
                  {Array.from({ length: 6 }).map((_, index) => <span key={`modal-table-skeleton-${index}`} />)}
                </div>
              ) : visibleTables.map((table) => {
                const isActive = String(table.id) === selectedTableId;
                return (
                  <button
                    key={table.id}
                    type="button"
                    className={isActive ? "is-active" : ""}
                    onClick={() => {
                      setSelectedTableId(String(table.id));
                      setIsMobileTablesOpen(false);
                      setMobileStep("catalog");
                    }}
                  >
                    {table.name}
                  </button>
                );
              })}
              {!loadingTables ? (
                <button
                  type="button"
                  className={!selectedTableId ? "is-active" : ""}
                  onClick={() => {
                    setSelectedTableId("");
                    setIsMobileTablesOpen(false);
                    setMobileStep("catalog");
                  }}
                >
                  Sin mesa (orden directa)
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {tablesError ? <p className="pos-v2-sales-home__error">{tablesError}</p> : null}

      {completedSale ? (
        <div className="pos-v2-sales-home__sale-modal" role="dialog" aria-modal="true" aria-label="Venta finalizada">
          <div className="pos-v2-sales-home__sale-modal-card">
            <h3>✅ Venta finalizada</h3>
            <p>Folio: <strong>{completedSale.folio}</strong></p>
            <p>Mesa: <strong>{completedSale.table}</strong></p>
            <p>Método: <strong>{completedSale.paymentMethodLabel}</strong></p>
            <p>Cliente: <strong>{completedSale.customerName ?? "General"}</strong></p>
            <p>Total: <strong>${completedSale.total.toFixed(2)}</strong></p>

            <div className="pos-v2-sales-home__sale-modal-actions">
              <button type="button" onClick={() => handlePrintSaleTicket(completedSale)}>Imprimir ticket</button>
              <button type="button" className="is-secondary" onClick={() => setCompletedSale(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      ) : null}

    </PosV2Shell>
  );
};
