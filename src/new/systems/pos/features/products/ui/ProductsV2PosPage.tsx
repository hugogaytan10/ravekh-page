import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ModernSystemsFactory } from "../../../../../index";
import { ProductImportResult } from "../interface/IProductsRepository";
import { ProductVariant, SaveManagedProductDto } from "../model/ManagedProduct";
import { ProductImportModal } from "./ProductImportModal";
import { CatalogAiImportWizard } from "./CatalogAiImportWizard";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { uploadImageToCloudinary } from "../../../shared/api/cloudinaryUpload";
import { POS_SESSION_STORAGE_KEYS } from "../../../shared/config/posSession";
import {
  POS_SESSION_UPDATED_EVENT,
  type PersistedPosSession,
} from "../../../shared/config/posSessionRuntime";
import {
  fetchPosBusinessFeatures,
  isPosFeatureBlocked,
  isPosModuleBlocked,
  POS_FEATURES_UNKNOWN,
  PosBusinessFeatures,
} from "../../../shared/config/posFeatureFlags";
import { onPosBusinessUpdated } from "../../../shared/config/posBusinessEvents";
import {
  FeatureUnlockModal,
  type UnlockFeature,
} from "../../../shared/ui/FeatureUnlockModal";
import { PlanUpgradeModal } from "../../../shared/ui/PlanUpgradeModal";
import type { PosPlan } from "../../../shared/config/posPlanAccess";
import { POS_V2_PATHS } from "../../../routing/PosV2Paths";
import "./ProductsV2PosPage.css";

const API_BASE_URL = getPosApiBaseUrl();
const DEFAULT_BUSINESS_ID = Number(import.meta.env.VITE_POS_BUSINESS_ID ?? 0);
const DEFAULT_PRODUCTS_LIMIT = "EMPRENDEDOR";
const TOKEN_KEY = POS_SESSION_STORAGE_KEYS.token;
const BUSINESS_ID_KEY = POS_SESSION_STORAGE_KEYS.businessId;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);
const FREE_PRODUCT_LIMIT = 20;
const START_PRODUCT_VARIANT_LIMIT = 2;
const FREE_PRODUCT_PLAN_VALUES = new Set([
  "GRATUITO",
  "PRUEBA",
  "GRATUITO ONLINE",
]);
const START_PRODUCT_PLAN_VALUES = new Set([
  "START",
  "EMPRENDEDOR",
  "EMPRESARIAL",
  "INICIAL",
  "BASICO",
]);

type ProductLimitUpgradeState = {
  currentCount: number;
  limit: number;
  requiredPlan: PosPlan;
};

type ProductItemVm = {
  id: number;
  name: string;
  description: string;
  categoryId: number | null;
  categoryName: string | null;
  color: string | null;
  available: boolean;
  forSale: boolean;
  showInStore: boolean;
  showPrice: boolean;
  volume: boolean;
  price: number | null;
  costPerItem: number | null;
  promotionPrice: number | null;
  wholesalePrice: number | null;
  wholesaleMinQuantity: number | null;
  stock: number | null;
  expDate: string | null;
  minStock: number | null;
  optStock: number | null;
  quantity: number | null;
  image: string | null;
  images: string[];
  variants: ProductVariant[];
  variantsCount?: number;
  extras: Array<{ description: string; type: string }>;
};

type VariantFormVm = {
  key: string;
  id?: number;
  productId?: number;
  description: string;
  color: string;
  price: string;
  promotionPrice: string;
  wholesalePrice: string;
  wholesaleMinQuantity: string;
  costPerItem: string;
  stock: string;
  minStock: string;
  optStock: string;
  expDate: string;
  barcode: string;
  Image: string | null;
  imageUploading: boolean;
  imageError: string | null;
};

type ViewMode = "grid" | "list";
type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc";
type ToastState = {
  type: "success" | "error" | "info";
  message: string;
} | null;
type ArchiveDialogState = { id: number; name: string } | null;
type ProductCategoryVm = { id: number; name: string; color: string };

const normalizeCategoryName = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("es-MX");
type SaveResultState = { type: "success" | "error"; message: string } | null;
type CategoryFormErrors = { name?: string; color?: string };

const compareByNameAsc = (a: ProductItemVm, b: ProductItemVm) =>
  a.name.localeCompare(b.name, "es", { sensitivity: "base" });
const compareByNameDesc = (a: ProductItemVm, b: ProductItemVm) =>
  compareByNameAsc(b, a);
const compareByPriceAsc = (a: ProductItemVm, b: ProductItemVm) => {
  const priceA = a.price ?? Number.POSITIVE_INFINITY;
  const priceB = b.price ?? Number.POSITIVE_INFINITY;
  return priceA - priceB;
};
const compareByPriceDesc = (a: ProductItemVm, b: ProductItemVm) => {
  const priceA = a.price ?? Number.NEGATIVE_INFINITY;
  const priceB = b.price ?? Number.NEGATIVE_INFINITY;
  return priceB - priceA;
};

const toImageUrl = (image?: string | null): string | null => {
  if (!image) return null;
  if (/^https?:\/\//i.test(image) || image.startsWith("data:")) return image;

  try {
    return new URL(
      image.startsWith("/") ? image.slice(1) : image,
      API_BASE_URL,
    ).toString();
  } catch {
    return null;
  }
};

const createVariantDraft = (): VariantFormVm => ({
  key: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  description: "",
  color: "",
  price: "",
  promotionPrice: "",
  wholesalePrice: "",
  wholesaleMinQuantity: "",
  costPerItem: "",
  stock: "",
  minStock: "",
  optStock: "",
  expDate: "",
  barcode: "",
  Image: null,
  imageUploading: false,
  imageError: null,
});

const validateImageFile = (file: File): string | null => {
  if (!ACCEPTED_IMAGE_TYPES.has(file.type))
    return "Solo se aceptan imágenes JPG, JPEG, PNG o WEBP.";
  if (file.size > MAX_IMAGE_SIZE_BYTES)
    return "La imagen no puede pesar más de 5MB.";
  return null;
};

const toNullableNumber = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

export const ProductsV2PosPage = () => {
  const navigate = useNavigate();
  const [businessId] = useState(() => {
    const storedBusinessId = Number(
      window.localStorage.getItem(BUSINESS_ID_KEY) ?? 0,
    );
    return storedBusinessId || DEFAULT_BUSINESS_ID;
  });
  const [token, setToken] = useState(
    () => window.localStorage.getItem(TOKEN_KEY) ?? "",
  );
  const [products, setProducts] = useState<ProductItemVm[]>([]);
  const [searchCatalogProducts, setSearchCatalogProducts] = useState<
    ProductItemVm[]
  >([]);
  const [categories, setCategories] = useState<ProductCategoryVm[]>([]);
  const [categoryNameInput, setCategoryNameInput] = useState("");
  const [categoryColorInput, setCategoryColorInput] = useState("#4F46E5");
  const [categorySearch, setCategorySearch] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null,
  );
  const [categoryFormErrors, setCategoryFormErrors] =
    useState<CategoryFormErrors>({});
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchingCatalog, setSearchingCatalog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [archivingId, setArchivingId] = useState<number | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAiImportOpen, setIsAiImportOpen] = useState(false);
  const [importResult, setImportResult] = useState<ProductImportResult | null>(
    null,
  );
  const [importError, setImportError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [archiveDialog, setArchiveDialog] = useState<ArchiveDialogState>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [saveResult, setSaveResult] = useState<SaveResultState>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [productsLimit, setProductsLimit] = useState(
    () =>
      (window.localStorage.getItem("plan") ?? "").trim() ||
      DEFAULT_PRODUCTS_LIMIT,
  );
  const [features, setFeatures] =
    useState<PosBusinessFeatures>(POS_FEATURES_UNKNOWN);
  const [showPosFeatureUnlock, setShowPosFeatureUnlock] = useState(false);
  const [productLimitUpgrade, setProductLimitUpgrade] =
    useState<ProductLimitUpgradeState | null>(null);
  const [productPlanUnlockModal, setProductPlanUnlockModal] = useState<{
    title: string;
    message: string;
    buttonText: string;
    unlockFeature?: UnlockFeature;
  } | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [costPerItem, setCostPerItem] = useState("");
  const [wholesalePrice, setWholesalePrice] = useState("");
  const [wholesaleMinQuantity, setWholesaleMinQuantity] = useState("");
  const [stock, setStock] = useState("");
  const [forSale, setForSale] = useState(true);
  const [showInStore, setShowInStore] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [available, setAvailable] = useState(true);
  const [productColor, setProductColor] = useState("");
  const [variants, setVariants] = useState<VariantFormVm[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [sizeDraft, setSizeDraft] = useState("");
  const [colorDraft, setColorDraft] = useState("");
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [storedImages, setStoredImages] = useState<string[]>([]);
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const categoryCarouselRef = useRef<HTMLDivElement | null>(null);
  const categoryNameInputRef = useRef<HTMLInputElement | null>(null);

  const service = useMemo(() => {
    const factory = new ModernSystemsFactory(API_BASE_URL);
    return factory.createPosProductsService();
  }, []);

  useEffect(() => {
    const handleSessionUpdated = (event: Event) => {
      const detail = (event as CustomEvent<PersistedPosSession>).detail;
      if (detail?.token) setToken(detail.token);
    };

    window.addEventListener(POS_SESSION_UPDATED_EVENT, handleSessionUpdated);
    return () => {
      window.removeEventListener(
        POS_SESSION_UPDATED_EVENT,
        handleSessionUpdated,
      );
    };
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice("");
    setCostPerItem("");
    setWholesalePrice("");
    setWholesaleMinQuantity("");
    setStock("");
    setForSale(true);
    setShowInStore(true);
    setShowPrice(true);
    setAvailable(true);
    setProductColor("");
    setVariants([]);
    setSelectedCategoryId(null);
    setSizeDraft("");
    setColorDraft("");
    setSizes([]);
    setColors([]);
    setStoredImages([]);
    setSelectedImageFiles([]);
  };

  const closeFormModal = () => {
    if (saving) return;
    setIsFormOpen(false);
    setSaveResult(null);
    resetForm();
  };

  const openPosFeatureUnlock = () => setShowPosFeatureUnlock(true);

  const blockBlockedProductModuleMutation = (): boolean => {
    if (!isPosModuleBlocked(features)) return false;
    openPosFeatureUnlock();
    return true;
  };

  const normalizePlanValue = (value?: string | null) =>
    String(value ?? "")
      .trim()
      .toUpperCase();

  const isFreePlan = useMemo(() => {
    const rawProductsLimit = normalizePlanValue(productsLimit);
    const rawFeaturePlan = normalizePlanValue(features.plan);
    return (
      FREE_PRODUCT_PLAN_VALUES.has(rawProductsLimit) ||
      FREE_PRODUCT_PLAN_VALUES.has(rawFeaturePlan)
    );
  }, [features.plan, productsLimit]);

  const isStartPlan = useMemo(() => {
    const rawProductsLimit = normalizePlanValue(productsLimit);
    const rawFeaturePlan = normalizePlanValue(features.plan);
    return (
      START_PRODUCT_PLAN_VALUES.has(rawProductsLimit) ||
      START_PRODUCT_PLAN_VALUES.has(rawFeaturePlan)
    );
  }, [features.plan, productsLimit]);

  const productLimitCount = Math.max(totalItems, products.length);
  const freeProductLimitReached =
    isFreePlan && productLimitCount >= FREE_PRODUCT_LIMIT;

  const openProductLimitUpgradeModal = (
    currentCount = productLimitCount,
    limit = FREE_PRODUCT_LIMIT,
  ) => {
    setProductLimitUpgrade({
      currentCount: Math.max(currentCount, limit),
      limit,
      requiredPlan: "START",
    });
  };

  const blockFreeProductCreation = (): boolean => {
    if (!freeProductLimitReached) return false;
    openProductLimitUpgradeModal();
    return true;
  };

  const closeProductLimitUpgradeModal = () => setProductLimitUpgrade(null);

  const openProductPlanCheckout = () => {
    const requiredPlan = productLimitUpgrade?.requiredPlan ?? "START";

    setProductLimitUpgrade(null);

    setProductPlanUnlockModal({
      title: `Activa ${requiredPlan}`,
      message:
        "Completa el pago para activar el paquete seleccionado y seguir agregando productos a tu catálogo.",
      buttonText: "Continuar al pago",
      unlockFeature: "Catalog",
    });
  };

  const openProductVariantUpgradeModal = () => {
    setProductPlanUnlockModal({
      title: "Activa START",
      message:
        "Actualiza tu plan para agregar variantes, tallas o colores a tus productos.",
      buttonText: "Continuar al pago",
      unlockFeature: "Catalog",
    });
  };

  const openStartVariantLimitUpgradeModal = () => {
    setProductPlanUnlockModal({
      title: "Activa PRO",
      message: `Tu plan START permite hasta ${START_PRODUCT_VARIANT_LIMIT} variantes por producto. Actualiza tu plan para agregar más variantes.`,
      buttonText: "Continuar al pago",
      unlockFeature: "Catalog",
    });
  };

  const canAddProductVariants = (): boolean => {
    if (isFreePlan) {
      openProductVariantUpgradeModal();
      return false;
    }

    if (isStartPlan && variants.length >= START_PRODUCT_VARIANT_LIMIT) {
      openStartVariantLimitUpgradeModal();
      return false;
    }

    return true;
  };

  const openWholesaleUpgradeModal = () => {
    setProductPlanUnlockModal({
      title: "Activa START",
      message:
        "Actualiza tu plan para capturar precios de mayoreo en tus productos.",
      buttonText: "Continuar al pago",
      unlockFeature: "Catalog",
    });
  };

  const canEditWholesalePrices = (): boolean => {
    if (!isFreePlan) return true;
    openWholesaleUpgradeModal();
    return false;
  };

  const getProductLimitPayload = (
    cause: unknown,
  ): {
    currentCount?: number;
    limit?: number;
    requiredPlan?: PosPlan;
  } | null => {
    const error = cause as Error & {
      payload?: {
        code?: string;
        message?: string;
        error?: string;
        currentCount?: number;
        limit?: number;
        requiredPlan?: PosPlan;
      };
    };
    const code = error?.payload?.code;
    const message = [
      error?.payload?.message,
      error?.payload?.error,
      error?.message,
    ]
      .filter(Boolean)
      .join(" ");

    if (
      code !== "FREE_PRODUCT_LIMIT_REACHED" &&
      !/plan gratuito permite hasta 20 productos/i.test(message)
    ) {
      return null;
    }

    return {
      currentCount: Number(error.payload?.currentCount ?? FREE_PRODUCT_LIMIT),
      limit: Number(error.payload?.limit ?? FREE_PRODUCT_LIMIT),
      requiredPlan: error.payload?.requiredPlan ?? "START",
    };
  };

  const openCreateModal = () => {
    if (blockBlockedProductModuleMutation()) return;
    if (blockFreeProductCreation()) return;
    resetForm();
    setSaveResult(null);
    setError(null);
    setIsFormOpen(true);
  };

  const openCategoryManager = () => {
    if (isPosModuleBlocked(features)) {
      openPosFeatureUnlock();
      return;
    }

    setShowCategoryManager(true);
  };

  const resetCategoryForm = () => {
    setEditingCategoryId(null);
    setCategoryNameInput("");
    setCategoryColorInput("#4F46E5");
    setCategoryFormErrors({});
  };

  useEffect(() => {
    if (!businessId || !token) return;

    const loadFeatures = () => {
      fetchPosBusinessFeatures(businessId, token, API_BASE_URL)
        .then(setFeatures)
        .catch(() => setFeatures(POS_FEATURES_UNKNOWN));
    };

    loadFeatures();

    return onPosBusinessUpdated((detail) => {
      if (detail.businessId !== businessId) return;
      loadFeatures();
    });
  }, [businessId, token]);

  useEffect(() => {
    if (!businessId || !token) return;

    const factory = new ModernSystemsFactory(API_BASE_URL);
    const businessService = factory.createPosBusinessSettingsService();

    businessService
      .getSettings(businessId, token)
      .then((settings) => {
        const normalizedPlan = (settings.plan ?? "").trim();
        if (!normalizedPlan) return;
        setProductsLimit(normalizedPlan);
        window.localStorage.setItem("plan", normalizedPlan);
      })
      .catch(() => undefined);
  }, [businessId, token]);

  const loadProducts = async (targetPage: number = currentPage) => {
    if (!businessId || !token) {
      setError("Inicia sesión para administrar productos.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await service.listProductsPaginated(
        businessId,
        token,
        targetPage,
        productsLimit,
      );
      const list = Array.isArray(response.products) ? response.products : [];
      setProducts(
        list.map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          categoryId: product.categoryId,
          categoryName: product.categoryName,
          color: product.color,
          available: product.available,
          forSale: product.forSale,
          showInStore: product.showInStore,
          showPrice: product.showPrice,
          volume: product.volume,
          price: product.price,
          costPerItem: product.costPerItem,
          promotionPrice: product.promotionPrice,
          wholesalePrice: product.wholesalePrice,
          wholesaleMinQuantity: product.wholesaleMinQuantity,
          stock: product.stock,
          expDate: product.expDate,
          minStock: product.minStock,
          optStock: product.optStock,
          quantity: product.quantity,
          image: product.image,
          images: product.images,
          variants: product.variants,
          variantsCount: product.variantsCount,
          extras: product.extras,
        })),
      );
      setSearchCatalogProducts([]);
      setCurrentPage(response.pagination.page);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.total);

      const categoryRows = await service.listCategories(businessId, token);
      const safeCategories = Array.isArray(categoryRows) ? categoryRows : [];
      setCategories(
        safeCategories
          .filter(
            (category) => typeof category.id === "number" && category.id > 0,
          )
          .map((category) => ({
            id: category.id as number,
            name: category.name,
            color: category.color,
          })),
      );
      if (list.length === 0) {
        setToast({ type: "info", message: "Aún no tienes productos." });
      }
    } catch (cause) {
      const rawMessage = cause instanceof Error ? cause.message : "";
      const isEmptyPayloadCrash =
        /cannot read properties of null/i.test(rawMessage) ||
        /reading ['"]data['"]/i.test(rawMessage);
      if (isEmptyPayloadCrash) {
        setError(null);
        setProducts([]);
        setCategories([]);
        setToast({ type: "info", message: "Aún no tienes productos." });
      } else {
        setError(rawMessage || "No se pudo cargar productos v2.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    loadProducts(1);
  }, [businessId, token, productsLimit]);

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  const visibleProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const comparators: Record<
      SortOption,
      (a: ProductItemVm, b: ProductItemVm) => number
    > = {
      "name-asc": compareByNameAsc,
      "name-desc": compareByNameDesc,
      "price-asc": compareByPriceAsc,
      "price-desc": compareByPriceDesc,
    };

    const source =
      normalizedSearch.length >= 2 ? searchCatalogProducts : products;

    return source
      .filter((product) => (showArchived ? true : product.available))
      .filter((product) => {
        if (!normalizedSearch) return true;

        return (
          product.name.toLowerCase().includes(normalizedSearch) ||
          product.description.toLowerCase().includes(normalizedSearch)
        );
      })
      .sort(comparators[sortBy]);
  }, [products, searchCatalogProducts, search, showArchived, sortBy]);

  useEffect(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (normalizedSearch.length < 2) {
      setSearchCatalogProducts([]);
      setSearchingCatalog(false);
      return;
    }

    if (!businessId || !token) {
      setSearchCatalogProducts([]);
      setSearchingCatalog(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      setSearchingCatalog(true);
      (async () => {
        try {
          const allRows = await service.listProductsAllForSearch(
            businessId,
            token,
            productsLimit,
          );
          const mapped = allRows.map((product) => ({
            id: product.id,
            name: product.name,
            description: product.description,
            categoryId: product.categoryId,
            categoryName: product.categoryName,
            color: product.color,
            available: product.available,
            forSale: product.forSale,
            showInStore: product.showInStore,
            showPrice: product.showPrice,
            volume: product.volume,
            price: product.price,
            costPerItem: product.costPerItem,
            promotionPrice: product.promotionPrice,
            wholesalePrice: product.wholesalePrice,
            wholesaleMinQuantity: product.wholesaleMinQuantity,
            stock: product.stock,
            expDate: product.expDate,
            minStock: product.minStock,
            optStock: product.optStock,
            quantity: product.quantity,
            image: product.image,
            images: product.images,
            variants: product.variants,
            variantsCount: product.variantsCount,
            extras: product.extras,
          }));
          setSearchCatalogProducts(mapped);
        } catch {
          setSearchCatalogProducts([]);
        } finally {
          setSearchingCatalog(false);
        }
      })();
    }, 320);

    return () => window.clearTimeout(timeout);
  }, [search, businessId, token, service, productsLimit]);

  const stats = useMemo(() => {
    const active = products.filter((product) => product.available).length;
    const archived = products.length - active;
    const withVariants = products.filter(
      (product) => product.variants.length > 0,
    ).length;
    return { total: products.length, active, archived, withVariants };
  }, [products]);

  const mappedVariants = (): ProductVariant[] => {
    return variants
      .filter((variant) =>
        [variant.description, variant.color, variant.barcode].some(
          (field) => field.trim().length > 0,
        ),
      )
      .map((variant, index) => ({
        description:
          variant.description.trim() ||
          variant.color.trim() ||
          `Variante ${index + 1}`,
        barcode: variant.barcode.trim() || null,
        color: variant.color.trim() || null,
        size: null,
        id: variant.id,
        productId: variant.productId,
        price: toNullableNumber(variant.price),
        stock: toNullableNumber(variant.stock),
        costPerItem: toNullableNumber(variant.costPerItem),
        promotionPrice: toNullableNumber(variant.promotionPrice),
        wholesalePrice: toNullableNumber(variant.wholesalePrice),
        wholesaleMinQuantity:
          variant.wholesalePrice.trim() === ""
            ? null
            : toNullableNumber(variant.wholesaleMinQuantity),
        minStock: toNullableNumber(variant.minStock),
        optStock: toNullableNumber(variant.optStock),
        expDate: variant.expDate.trim() || null,
        Image: variant.Image ?? null,
      }));
  };

  const extrasFromValues = (values: string[], type: "TALLA" | "COLOR") =>
    Array.from(
      new Set(values.map((value) => value.trim()).filter(Boolean)),
    ).map((description) => ({
      description,
      type,
    }));

  const pushUniqueTag = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    inputSetter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    const normalized = value.trim();
    if (!normalized) return;

    setter((current) => {
      const alreadyExists = current.some(
        (entry) => entry.toLowerCase() === normalized.toLowerCase(),
      );
      return alreadyExists ? current : [...current, normalized];
    });
    inputSetter("");
  };

  const removeTag = (
    indexToRemove: number,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setter((current) => current.filter((_, index) => index !== indexToRemove));
  };

  const addVariantDraft = () => {
    if (!canAddProductVariants()) return;
    setVariants((current) => [...current, createVariantDraft()]);
  };

  const addSizeTag = () => {
    if (!canAddProductVariants()) return;
    pushUniqueTag(sizeDraft, setSizes, setSizeDraft);
  };

  const addColorTag = () => {
    if (!canAddProductVariants()) return;
    pushUniqueTag(colorDraft, setColors, setColorDraft);
  };

  const handleWholesalePriceChange = (value: string) => {
    if (!canEditWholesalePrices()) return;
    setWholesalePrice(value);
    if (value.trim() === "") {
      setWholesaleMinQuantity("");
    }
  };

  const handleWholesaleMinQuantityChange = (value: string) => {
    if (!canEditWholesalePrices()) return;
    setWholesaleMinQuantity(value);
  };

  const handleVariantWholesaleChange = (
    key: string,
    field: "wholesalePrice" | "wholesaleMinQuantity",
    value: string,
  ) => {
    if (!canEditWholesalePrices()) return;
    updateVariant(key, field, value);
  };

  const formImagePreviews = useMemo(() => {
    const remote = storedImages
      .map((img, index) => ({
        key: `stored-${index}`,
        source: "stored" as const,
        index,
        src: toImageUrl(img),
      }))
      .filter((item) => Boolean(item.src))
      .map((item) => ({ ...item, src: item.src as string }));
    const local = selectedImageFiles.map((file, index) => ({
      key: `local-${index}`,
      source: "local" as const,
      index,
      src: URL.createObjectURL(file),
    }));
    return [...remote, ...local];
  }, [storedImages, selectedImageFiles]);

  useEffect(() => {
    return () => {
      formImagePreviews.forEach((image) => {
        if (image.src.startsWith("blob:")) {
          URL.revokeObjectURL(image.src);
        }
      });
    };
  }, [formImagePreviews]);

  useEffect(() => {
    if (!showCategoryManager) return;
    const timeout = window.setTimeout(
      () => categoryNameInputRef.current?.focus(),
      90,
    );
    return () => window.clearTimeout(timeout);
  }, [showCategoryManager, editingCategoryId]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (blockBlockedProductModuleMutation()) {
      closeFormModal();
      return;
    }

    if (!editingId && blockFreeProductCreation()) {
      return;
    }

    if (!businessId) {
      setError("Business ID es obligatorio.");
      return;
    }

    if (!token) {
      setError("Token es obligatorio para operar POS v2.");
      return;
    }

    if (!name.trim()) {
      setError("El nombre del producto es obligatorio.");
      return;
    }

    if (variants.some((variant) => variant.imageUploading)) {
      setError("Espera a que terminen de subir las imágenes de variantes.");
      return;
    }

    const parsedPrice = price.trim() === "" ? null : Number(price);
    const parsedCostPerItem =
      costPerItem.trim() === "" ? null : Number(costPerItem);
    const parsedWholesalePrice =
      wholesalePrice.trim() === "" ? null : Number(wholesalePrice);
    const parsedWholesaleMinQuantity =
      wholesaleMinQuantity.trim() === "" ? null : Number(wholesaleMinQuantity);
    const normalizedWholesaleMinQuantity =
      parsedWholesalePrice === null ? null : parsedWholesaleMinQuantity;
    const parsedStock = stock.trim() === "" ? null : Number(stock);

    if (
      parsedPrice !== null &&
      (Number.isNaN(parsedPrice) || parsedPrice < 0)
    ) {
      setError("El precio debe ser un número válido mayor o igual a 0.");
      return;
    }

    if (
      parsedStock !== null &&
      (Number.isNaN(parsedStock) || parsedStock < 0)
    ) {
      setError("El stock debe ser un número válido mayor o igual a 0.");
      return;
    }

    if (
      parsedCostPerItem !== null &&
      (Number.isNaN(parsedCostPerItem) || parsedCostPerItem < 0)
    ) {
      setError(
        "El costo por producto debe ser un número válido mayor o igual a 0.",
      );
      return;
    }

    if (
      parsedWholesalePrice !== null &&
      (Number.isNaN(parsedWholesalePrice) || parsedWholesalePrice <= 0)
    ) {
      setError("El precio por mayoreo debe ser un número válido mayor a 0.");
      return;
    }

    if (parsedWholesalePrice !== null && parsedPrice === null) {
      setError(
        "Agrega el precio normal antes de configurar precio por mayoreo.",
      );
      return;
    }

    if (
      parsedWholesalePrice !== null &&
      parsedPrice !== null &&
      parsedWholesalePrice > parsedPrice
    ) {
      setError(
        "El precio por mayoreo no puede ser mayor que el precio normal.",
      );
      return;
    }

    if (
      parsedWholesalePrice !== null &&
      normalizedWholesaleMinQuantity === null
    ) {
      setError(
        "La cantidad mínima para mayoreo es obligatoria cuando agregas precio por mayoreo.",
      );
      return;
    }

    if (parsedWholesalePrice === null && parsedWholesaleMinQuantity !== null) {
      setError(
        "No puedes agregar cantidad mínima para mayoreo sin precio por mayoreo.",
      );
      return;
    }

    if (
      normalizedWholesaleMinQuantity !== null &&
      (Number.isNaN(normalizedWholesaleMinQuantity) ||
        normalizedWholesaleMinQuantity < 2)
    ) {
      setError("La cantidad mínima para mayoreo debe ser mayor o igual a 2.");
      return;
    }

    for (const [index, variant] of variants.entries()) {
      const parsedVariantPrice =
        variant.price.trim() === "" ? null : Number(variant.price);
      const parsedVariantWholesalePrice =
        variant.wholesalePrice.trim() === ""
          ? null
          : Number(variant.wholesalePrice);
      const parsedVariantWholesaleMinQuantity =
        variant.wholesaleMinQuantity.trim() === ""
          ? null
          : Number(variant.wholesaleMinQuantity);
      const variantLabel = `variante ${index + 1}`;

      if (
        parsedVariantWholesalePrice !== null &&
        (Number.isNaN(parsedVariantWholesalePrice) ||
          parsedVariantWholesalePrice <= 0)
      ) {
        setError(
          `El precio por mayoreo de la ${variantLabel} debe ser mayor a 0.`,
        );
        return;
      }

      if (parsedVariantWholesalePrice !== null && parsedVariantPrice === null) {
        setError(
          `Agrega el precio normal de la ${variantLabel} antes de configurar mayoreo.`,
        );
        return;
      }

      if (
        parsedVariantWholesalePrice !== null &&
        parsedVariantPrice !== null &&
        parsedVariantWholesalePrice > parsedVariantPrice
      ) {
        setError(
          `El precio por mayoreo de la ${variantLabel} no puede ser mayor que su precio normal.`,
        );
        return;
      }

      if (
        parsedVariantWholesalePrice !== null &&
        parsedVariantWholesaleMinQuantity === null
      ) {
        setError(
          `La cantidad mínima para mayoreo de la ${variantLabel} es obligatoria.`,
        );
        return;
      }

      if (
        parsedVariantWholesalePrice === null &&
        parsedVariantWholesaleMinQuantity !== null
      ) {
        setError(
          `No puedes agregar cantidad mínima para mayoreo en la ${variantLabel} sin precio por mayoreo.`,
        );
        return;
      }

      if (
        parsedVariantWholesaleMinQuantity !== null &&
        (Number.isNaN(parsedVariantWholesaleMinQuantity) ||
          parsedVariantWholesaleMinQuantity < 2)
      ) {
        setError(
          `La cantidad mínima para mayoreo de la ${variantLabel} debe ser mayor o igual a 2.`,
        );
        return;
      }
    }

    setSaving(true);
    setError(null);
    setSaveResult(null);

    try {
      const uploadedImages = await Promise.all(
        selectedImageFiles.map((file) => uploadImageToCloudinary(file)),
      );
      const allImages = Array.from(
        new Set([...uploadedImages, ...storedImages].filter(Boolean)),
      );

      const payload: SaveManagedProductDto = {
        id: editingId ?? undefined,
        businessId,
        name: name.trim(),
        description: description.trim(),
        forSale,
        showInStore,
        showPrice,
        available,
        color: productColor.trim() || null,
        volume: false,
        price: parsedPrice,
        promotionPrice: null,
        wholesalePrice: parsedWholesalePrice,
        wholesaleMinQuantity: normalizedWholesaleMinQuantity,
        stock: parsedStock,
        expDate: null,
        minStock: null,
        optStock: null,
        quantity: null,
        image: allImages[0] || undefined,
        images: allImages,
        costPerItem: parsedCostPerItem,
        barcode: null,
        categoryId: selectedCategoryId,
        variants: mappedVariants(),
        extras: [
          ...extrasFromValues(sizes, "TALLA"),
          ...extrasFromValues(colors, "COLOR"),
        ],
      };
      const saved = await service.saveProduct(payload, token);
      const actionLabel = editingId ? "actualizó" : "creó";
      setSaveResult({
        type: "success",
        message: `Se ${actionLabel} el producto #${saved.id} correctamente.`,
      });
      resetForm();
      setIsFormOpen(false);
      setToast({
        type: "success",
        message: editingId
          ? "Producto actualizado correctamente."
          : "Producto creado correctamente.",
      });
      await loadProducts(currentPage);
    } catch (cause) {
      const productLimitPayload = getProductLimitPayload(cause);
      if (!editingId && productLimitPayload) {
        setIsFormOpen(false);
        openProductLimitUpgradeModal(
          productLimitPayload.currentCount,
          productLimitPayload.limit,
        );
      }
      setError(
        cause instanceof Error ? cause.message : "No se pudo guardar producto.",
      );
      setSaveResult({
        type: "error",
        message:
          cause instanceof Error
            ? cause.message
            : "No se pudo guardar producto.",
      });
      setToast({
        type: "error",
        message:
          cause instanceof Error
            ? cause.message
            : "No se pudo guardar producto.",
      });
    } finally {
      setSaving(false);
    }
  };

  const cloneSavePayload = (
    detail: Awaited<ReturnType<typeof service.getProduct>>,
  ): SaveManagedProductDto => ({
    id: detail?.id,
    businessId,
    name: detail?.name ?? "",
    description: detail?.description ?? "",
    forSale: detail?.forSale ?? true,
    showInStore: detail?.showInStore ?? true,
    showPrice: detail?.showPrice ?? true,
    available: detail?.available ?? true,
    color: detail?.color ?? null,
    volume: detail?.volume ?? false,
    price: detail?.price ?? null,
    promotionPrice: detail?.promotionPrice ?? null,
    wholesalePrice: detail?.wholesalePrice ?? null,
    wholesaleMinQuantity: detail?.wholesaleMinQuantity ?? null,
    stock: detail?.stock ?? null,
    expDate: detail?.expDate ?? null,
    minStock: detail?.minStock ?? null,
    optStock: detail?.optStock ?? null,
    quantity: detail?.quantity ?? null,
    image: detail?.image ?? undefined,
    images: detail?.images ?? [],
    costPerItem: detail?.costPerItem ?? null,
    barcode: detail?.barcode ?? null,
    categoryId: detail?.categoryId ?? null,
    variants: detail?.variants ?? [],
    extras: detail?.extras ?? [],
  });

  const handleRestore = async (productId: number) => {
    if (blockBlockedProductModuleMutation()) return;
    if (!token) {
      setToast({
        type: "error",
        message: "Token es obligatorio para restaurar.",
      });
      return;
    }

    setActionLoadingId(productId);
    try {
      const detail = await service.getProduct(productId, token);
      if (!detail)
        throw new Error("No encontramos el producto para restaurar.");
      await service.saveProduct(
        { ...cloneSavePayload(detail), available: true },
        token,
      );
      setToast({
        type: "success",
        message: `Producto "${detail.name}" restaurado.`,
      });
      await loadProducts(currentPage);
    } catch (cause) {
      setToast({
        type: "error",
        message:
          cause instanceof Error
            ? cause.message
            : "No se pudo restaurar producto.",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleEdit = async (productId: number) => {
    if (blockBlockedProductModuleMutation()) return;
    if (!token) {
      setError("Token es obligatorio para editar.");
      return;
    }

    try {
      const detail = await service.getProduct(productId, token);
      if (!detail) {
        throw new Error("No encontramos el producto seleccionado.");
      }

      setEditingId(detail.id);
      setName(detail.name);
      setDescription(detail.description);
      setPrice(detail.price == null ? "" : String(detail.price));
      setCostPerItem(
        detail.costPerItem == null ? "" : String(detail.costPerItem),
      );
      setWholesalePrice(
        detail.wholesalePrice == null ? "" : String(detail.wholesalePrice),
      );
      setWholesaleMinQuantity(
        detail.wholesaleMinQuantity == null
          ? ""
          : String(detail.wholesaleMinQuantity),
      );
      setStock(detail.stock == null ? "" : String(detail.stock));
      setForSale(detail.forSale);
      setShowInStore(detail.showInStore);
      setShowPrice(detail.showPrice);
      setAvailable(detail.available);
      setProductColor(detail.color ?? "");
      setSelectedCategoryId(detail.categoryId ?? null);
      setStoredImages(
        Array.from(
          new Set([detail.image, ...detail.images].filter(Boolean) as string[]),
        ),
      );
      setSelectedImageFiles([]);
      setSizes(
        detail.extras
          .filter((extra) => extra.type.toUpperCase() === "TALLA")
          .map((extra) => extra.description),
      );
      setColors(
        detail.extras
          .filter((extra) => extra.type.toUpperCase() === "COLOR")
          .map((extra) => extra.description),
      );
      setSizeDraft("");
      setColorDraft("");
      setVariants(
        detail.variants.map((variant, index) => ({
          key: `${detail.id}-${index}`,
          id: variant.id,
          productId: variant.productId,
          description: variant.description ?? "",
          color: variant.color ?? "",
          price: variant.price == null ? "" : String(variant.price),
          promotionPrice:
            variant.promotionPrice == null
              ? ""
              : String(variant.promotionPrice),
          wholesalePrice:
            variant.wholesalePrice == null
              ? ""
              : String(variant.wholesalePrice),
          wholesaleMinQuantity:
            variant.wholesaleMinQuantity == null
              ? ""
              : String(variant.wholesaleMinQuantity),
          costPerItem:
            variant.costPerItem == null ? "" : String(variant.costPerItem),
          stock: variant.stock == null ? "" : String(variant.stock),
          minStock: variant.minStock == null ? "" : String(variant.minStock),
          optStock: variant.optStock == null ? "" : String(variant.optStock),
          expDate: variant.expDate ?? "",
          barcode: variant.barcode ?? "",
          Image: variant.Image ?? null,
          imageUploading: false,
          imageError: null,
        })),
      );
      setError(null);
      setIsFormOpen(true);
      setSaveResult(null);
      setToast(null);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudo cargar el producto para edición.",
      );
      setToast({
        type: "error",
        message:
          cause instanceof Error
            ? cause.message
            : "No se pudo cargar el producto para edición.",
      });
    }
  };

  const requestArchive = (productId: number, productName: string) => {
    if (blockBlockedProductModuleMutation()) return;
    setArchiveDialog({ id: productId, name: productName });
  };

  const handleArchive = async () => {
    if (!archiveDialog) return;
    if (blockBlockedProductModuleMutation()) {
      setArchiveDialog(null);
      return;
    }

    if (!token) {
      setError("Token es obligatorio para eliminar/archivar.");
      setToast({
        type: "error",
        message: "Token es obligatorio para eliminar/archivar.",
      });
      return;
    }

    setArchivingId(archiveDialog.id);
    setError(null);

    try {
      await service.archiveProduct(archiveDialog.id, token);
      if (editingId === archiveDialog.id) {
        closeFormModal();
      }
      setToast({
        type: "success",
        message: `Producto "${archiveDialog.name}" archivado.`,
      });
      setArchiveDialog(null);
      await loadProducts(currentPage);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudo eliminar/archivar producto.",
      );
      setToast({
        type: "error",
        message:
          cause instanceof Error
            ? cause.message
            : "No se pudo eliminar/archivar producto.",
      });
    } finally {
      setArchivingId(null);
    }
  };

  const handleImageInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const validFiles = files.filter((file) => {
      const validationError = validateImageFile(file);
      if (validationError) setError(validationError);
      return !validationError;
    });
    if (validFiles.length === 0) return;
    setSelectedImageFiles((current) => [...current, ...validFiles]);
    event.target.value = "";
  };

  const removeVariant = (key: string) =>
    setVariants((current) => current.filter((variant) => variant.key !== key));
  const removeStoredImage = (indexToRemove: number) =>
    setStoredImages((current) =>
      current.filter((_, index) => index !== indexToRemove),
    );
  const removeSelectedImage = (indexToRemove: number) =>
    setSelectedImageFiles((current) =>
      current.filter((_, index) => index !== indexToRemove),
    );

  const updateVariant = (
    key: string,
    field: keyof Pick<
      VariantFormVm,
      | "description"
      | "color"
      | "price"
      | "promotionPrice"
      | "wholesalePrice"
      | "wholesaleMinQuantity"
      | "costPerItem"
      | "stock"
      | "minStock"
      | "optStock"
      | "expDate"
      | "barcode"
    >,
    value: string,
  ) => {
    setVariants((current) =>
      current.map((variant) => {
        if (variant.key !== key) return variant;
        return {
          ...variant,
          [field]: value,
          ...(field === "wholesalePrice" && value.trim() === ""
            ? { wholesaleMinQuantity: "" }
            : {}),
        };
      }),
    );
  };

  const updateVariantImageState = (
    key: string,
    patch: Partial<
      Pick<VariantFormVm, "Image" | "imageUploading" | "imageError">
    >,
  ) => {
    setVariants((current) =>
      current.map((variant) =>
        variant.key === key ? { ...variant, ...patch } : variant,
      ),
    );
  };

  const handleVariantImageInput = async (
    key: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      updateVariantImageState(key, { imageError: validationError });
      return;
    }

    updateVariantImageState(key, { imageUploading: true, imageError: null });
    try {
      const imageUrl = await uploadImageToCloudinary(file);
      updateVariantImageState(key, {
        Image: imageUrl,
        imageUploading: false,
        imageError: null,
      });
    } catch (cause) {
      updateVariantImageState(key, {
        imageUploading: false,
        imageError:
          cause instanceof Error
            ? cause.message
            : "No se pudo subir la imagen de la variante.",
      });
    }
  };

  const removeVariantImage = (key: string) => {
    updateVariantImageState(key, { Image: null, imageError: null });
  };

  const validateCategoryForm = (): boolean => {
    const nextErrors: CategoryFormErrors = {};
    const normalizedName = categoryNameInput.trim();
    const colorPattern = /^#[\da-f]{6}$/i;

    if (!normalizedName) {
      nextErrors.name = "El nombre es obligatorio.";
    } else if (normalizedName.length < 2) {
      nextErrors.name = "Escribe al menos 2 caracteres.";
    } else if (normalizedName.length > 50) {
      nextErrors.name = "Máximo 50 caracteres.";
    }

    if (!colorPattern.test(categoryColorInput.trim())) {
      nextErrors.color =
        "Selecciona un color hexadecimal válido (ej. #4F46E5).";
    }

    setCategoryFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const createCategoryFromAiReview = async (input: {
    name: string;
    color: string;
  }): Promise<ProductCategoryVm> => {
    if (!token || !businessId) {
      throw new Error("Inicia sesión para crear categorías.");
    }

    const name = input.name.trim().replace(/\s+/g, " ");
    const color = /^#[0-9A-Fa-f]{6}$/.test(input.color.trim())
      ? input.color.trim().toUpperCase()
      : "#6D01D1";

    const existing = categories.find(
      (category) =>
        normalizeCategoryName(category.name) === normalizeCategoryName(name),
    );
    if (existing) return existing;

    await service.createCategory(
      {
        businessId,
        name,
        color,
      },
      token,
    );

    const categoryRows = await service.listCategories(businessId, token);
    const refreshedCategories = (Array.isArray(categoryRows) ? categoryRows : [])
      .filter(
        (category) => typeof category.id === "number" && category.id > 0,
      )
      .map((category) => ({
        id: category.id as number,
        name: category.name,
        color: category.color || color,
      }));

    setCategories(refreshedCategories);

    const created = refreshedCategories.find(
      (category) =>
        normalizeCategoryName(category.name) === normalizeCategoryName(name),
    );

    if (!created) {
      throw new Error("La categoría se creó, pero no pudo recuperarse para seleccionarla.");
    }

    setToast({
      type: "success",
      message: `Categoría “${created.name}” creada.`,
    });

    return created;
  };

  const saveCategory = async () => {
    if (isPosModuleBlocked(features)) {
      setShowCategoryManager(false);
      openPosFeatureUnlock();
      return;
    }
    if (!token || !businessId) return;
    if (!validateCategoryForm()) {
      setToast({
        type: "error",
        message: "Revisa los campos de categoría para continuar.",
      });
      return;
    }

    try {
      if (editingCategoryId) {
        await service.updateCategory(
          {
            id: editingCategoryId,
            businessId,
            name: categoryNameInput.trim(),
            color: categoryColorInput.trim(),
          },
          token,
        );
        setToast({ type: "success", message: "Categoría actualizada." });
      } else {
        await service.createCategory(
          {
            businessId,
            name: categoryNameInput.trim(),
            color: categoryColorInput.trim(),
          },
          token,
        );
        setToast({ type: "success", message: "Categoría creada." });
      }
      resetCategoryForm();
      await loadProducts(currentPage);
    } catch (cause) {
      setToast({
        type: "error",
        message:
          cause instanceof Error
            ? cause.message
            : "No se pudo guardar categoría.",
      });
    }
  };

  const editCategory = (category: ProductCategoryVm) => {
    if (isPosModuleBlocked(features)) {
      setShowCategoryManager(false);
      openPosFeatureUnlock();
      return;
    }
    setEditingCategoryId(category.id);
    setCategoryNameInput(category.name);
    setCategoryColorInput(category.color || "#4F46E5");
    setCategoryFormErrors({});
    setShowCategoryManager(true);
  };

  const deleteCategory = async (categoryId: number) => {
    if (isPosModuleBlocked(features)) {
      setShowCategoryManager(false);
      openPosFeatureUnlock();
      return;
    }
    if (!token) return;
    try {
      await service.deleteCategory(categoryId, token);
      if (selectedCategoryId === categoryId) {
        setSelectedCategoryId(null);
      }
      setToast({ type: "success", message: "Categoría eliminada." });
      await loadProducts(currentPage);
    } catch (cause) {
      setToast({
        type: "error",
        message:
          cause instanceof Error
            ? cause.message
            : "No se pudo eliminar categoría.",
      });
    }
  };

  const visibleCategories = useMemo(() => {
    const normalized = categorySearch.trim().toLowerCase();
    if (!normalized) return categories;
    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(normalized) ||
        category.color.toLowerCase().includes(normalized),
    );
  }, [categories, categorySearch]);

  const availableColorOptions = useMemo(() => {
    const fromExtras = colors.map((color) => color.trim()).filter(Boolean);
    if (
      productColor.trim() &&
      !fromExtras.some(
        (entry) => entry.toLowerCase() === productColor.trim().toLowerCase(),
      )
    ) {
      return [productColor.trim(), ...fromExtras];
    }
    return fromExtras;
  }, [colors, productColor]);

  const isCategoryFormReady = useMemo(() => {
    const normalizedName = categoryNameInput.trim();
    const isValidName =
      normalizedName.length >= 2 && normalizedName.length <= 50;
    const isValidColor = /^#[\da-f]{6}$/i.test(categoryColorInput.trim());
    return isValidName && isValidColor;
  }, [categoryNameInput, categoryColorInput]);

  const scrollCategoryChips = (direction: "left" | "right") => {
    if (!categoryCarouselRef.current) return;
    const offset = direction === "left" ? -220 : 220;
    categoryCarouselRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  const getImportErrorMessage = (cause: unknown): string => {
    if (cause instanceof Error) {
      const payload = (
        cause as Error & { payload?: { message?: string; error?: string } }
      ).payload;
      return (
        [payload?.message, payload?.error].filter(Boolean).join(" — ") ||
        cause.message
      );
    }
    return "No se pudo importar el archivo.";
  };

  const openImportModal = () => {
    setImportResult(null);
    setImportError(null);
    setIsImportModalOpen(true);
  };

  const closeImportModal = () => {
    if (importing) return;
    setIsImportModalOpen(false);
    setImportResult(null);
    setImportError(null);
  };

  const finishImport = async (result: ProductImportResult) => {
    const failed = result.errors.length;
    setImportResult(result);
    if (failed > 0) {
      setToast({
        type: "info",
        message: `${result.message} (${result.imported} importados, ${failed} con error).`,
      });
    } else {
      setToast({
        type: "success",
        message: `${result.message} (${result.imported} productos importados).`,
      });
    }
    await loadProducts(currentPage);
  };

  const handleImportProducts = async (file: File) => {
    if (!token || !businessId) {
      setImportError("Conecta tu sesión para importar productos.");
      return;
    }

    setImporting(true);
    setImportError(null);
    setImportResult(null);
    try {
      const result = await service.importProducts(businessId, file, token);
      await finishImport(result);
    } catch (cause) {
      const productLimitPayload = getProductLimitPayload(cause);
      if (productLimitPayload) {
        closeImportModal();
        openProductLimitUpgradeModal(
          productLimitPayload.currentCount,
          productLimitPayload.limit,
        );
      }
      const message = getImportErrorMessage(cause);
      setImportError(message);
      setToast({ type: "error", message });
    } finally {
      setImporting(false);
    }
  };

  const handleImportProductsZip = async (file: File) => {
    if (!token || !businessId) {
      setImportError("Conecta tu sesión para importar productos.");
      return;
    }

    setImporting(true);
    setImportError(null);
    setImportResult(null);
    try {
      const result = await service.importProductsZip(businessId, file, token);
      await finishImport(result);
    } catch (cause) {
      const productLimitPayload = getProductLimitPayload(cause);
      if (productLimitPayload) {
        closeImportModal();
        openProductLimitUpgradeModal(
          productLimitPayload.currentCount,
          productLimitPayload.limit,
        );
      }
      const message = getImportErrorMessage(cause);
      setImportError(message);
      setToast({ type: "error", message });
    } finally {
      setImporting(false);
    }
  };

  const handleGoToPage = (event: FormEvent) => {
    event.preventDefault();
    const parsedTarget = Number(pageInput);
    if (!Number.isFinite(parsedTarget)) {
      setPageInput(String(currentPage));
      return;
    }

    const boundedPage = Math.min(
      totalPages,
      Math.max(1, Math.trunc(parsedTarget)),
    );
    if (boundedPage === currentPage) {
      setPageInput(String(boundedPage));
      return;
    }

    void loadProducts(boundedPage);
  };

  const isVipPlan = useMemo(
    () => productsLimit.trim().toUpperCase().includes("VIP"),
    [productsLimit],
  );

  const handleExportProducts = async () => {
    if (!businessId || !token) {
      setToast({
        type: "error",
        message: "Conecta tu sesión para exportar productos.",
      });
      return;
    }
    if (!isVipPlan) {
      setToast({
        type: "info",
        message:
          "La exportación de productos está disponible solo para el plan VIP.",
      });
      return;
    }

    const csvHeaders = [
      "Código de barras",
      "Nombre de producto",
      "Variante de",
      "Descripción",
      "Costo de adquisición",
      "Precio de venta",
      "Inventario actual",
      "Inventario mínimo",
      "Inventario óptimo",
      "Categoría",
      "Fecha de caducidad",
      "A la venta",
      "Disponible",
      "Se muestra en tienda",
      "Precio de promoción",
      "Tiene precio de promoción",
      "Imágenes",
    ];
    const toCsvValue = (
      value: string | number | boolean | null | undefined,
    ) => {
      if (value == null) return "";
      const text = String(value).replace(/"/g, '""');
      return `"${text}"`;
    };
    const yesNo = (value: boolean) => (value ? "Sí" : "No");
    const serializeNumber = (value: number | null) =>
      value == null ? "" : String(value);
    const formatDate = (rawDate: string | null) =>
      rawDate ? rawDate.slice(0, 10) : "";

    const allProducts: ProductItemVm[] = [];
    let page = 1;
    let lastPage = 1;

    try {
      do {
        const response = await service.listProductsPaginated(
          businessId,
          token,
          page,
          productsLimit,
        );
        const rows = Array.isArray(response.products) ? response.products : [];
        allProducts.push(
          ...rows.map((product) => ({
            id: product.id,
            name: product.name,
            description: product.description,
            categoryId: product.categoryId,
            categoryName: product.categoryName,
            color: product.color,
            available: product.available,
            forSale: product.forSale,
            showInStore: product.showInStore,
            showPrice: product.showPrice,
            volume: product.volume,
            price: product.price,
            costPerItem: product.costPerItem,
            promotionPrice: product.promotionPrice,
            wholesalePrice: product.wholesalePrice,
            wholesaleMinQuantity: product.wholesaleMinQuantity,
            stock: product.stock,
            expDate: product.expDate,
            minStock: product.minStock,
            optStock: product.optStock,
            quantity: product.quantity,
            image: product.image,
            images: product.images,
            variants: product.variants,
            variantsCount: product.variantsCount,
            extras: product.extras,
          })),
        );
        lastPage = Math.max(response.pagination.totalPages ?? 1, 1);
        page += 1;
      } while (page <= lastPage);

      const lines = [
        csvHeaders.map(toCsvValue).join(","),
        ...allProducts.map((product) => {
          const barcode =
            product.variants.find((variant) => variant.barcode)?.barcode ?? "";
          const imageList = [product.image, ...product.images]
            .filter(Boolean)
            .join(" | ");
          const row = [
            barcode,
            product.name,
            "",
            product.description,
            serializeNumber(product.costPerItem),
            serializeNumber(product.price),
            serializeNumber(product.stock),
            serializeNumber(product.minStock),
            serializeNumber(product.optStock),
            product.categoryName ?? "",
            formatDate(product.expDate),
            yesNo(product.forSale),
            yesNo(product.available),
            yesNo(product.showInStore),
            serializeNumber(product.promotionPrice),
            yesNo((product.promotionPrice ?? 0) > 0),
            imageList,
          ];
          return row.map(toCsvValue).join(",");
        }),
      ];

      const csvContent = `\uFEFF${lines.join("\n")}`;
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateChunk = new Date().toISOString().slice(0, 10);
      link.href = objectUrl;
      link.download = `productos-${dateChunk}.csv`;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
      setToast({
        type: "success",
        message: `Exportación completada (${allProducts.length} productos).`,
      });
    } catch (cause) {
      setToast({
        type: "error",
        message:
          cause instanceof Error
            ? cause.message
            : "No se pudo exportar productos.",
      });
    }
  };

  return (
    <PosV2Shell
      title="Productos"
      subtitle="Catálogo moderno para operar tu POS de forma rápida."
    >
      <section className="pos-v2-products">
        <header className="pos-v2-products__header">
          <div>
            <h2>Gestión de productos</h2>
            <p>
              Alta y edición en modal, manteniendo la vista del catálogo limpia
              y rápida para POS.
            </p>
          </div>

          <div className="pos-v2-products__header-actions">
            <button
              type="button"
              className="pos-v2-products__secondary pos-v2-products__back-main"
              onClick={() => navigate(-1)}
            >
              ← Regresar
            </button>
            <button
              type="button"
              className="pos-v2-products__secondary"
              onClick={openCreateModal}
            >
              + Nuevo
            </button>
            <button
              type="button"
              className="pos-v2-products__secondary"
              onClick={() => setShowCategoryManager(true)}
            >
              Categorías
            </button>
            <button
              type="button"
              className="pos-v2-products__primary"
              onClick={() => {
                if (blockBlockedProductModuleMutation()) return;
                if (blockFreeProductCreation()) return;
                setIsAiImportOpen(true);
              }}
              disabled={!token || !businessId}
            >
              ✦ Importar con IA
            </button>
            <button
              type="button"
              className="pos-v2-products__secondary"
              onClick={openImportModal}
              disabled={importing || !token || !businessId}
            >
              {importing ? "Importando..." : "Importar CSV"}
            </button>
            <button
              type="button"
              className="pos-v2-products__secondary"
              onClick={handleExportProducts}
              disabled={!isVipPlan || !token || !businessId}
            >
              Exportar productos {isVipPlan ? "" : "(VIP)"}
            </button>
            <button
              type="button"
              className="pos-v2-products__refresh"
              onClick={() => loadProducts(currentPage)}
              disabled={loading || !token || !businessId}
            >
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </header>

        <CatalogAiImportWizard
          open={isAiImportOpen}
          businessId={businessId}
          token={token}
          categories={categories}
          onCreateCategory={createCategoryFromAiReview}
          onClose={() => setIsAiImportOpen(false)}
          onSessionRefreshed={setToken}
          onCompleted={({ created }) => {
            setIsAiImportOpen(false);
            setToast({
              type: "success",
              message: `${created} producto(s) creados con IA.`,
            });
            void loadProducts(1);
          }}
        />

        <ProductImportModal
          open={isImportModalOpen}
          businessId={businessId}
          token={token}
          importing={importing}
          result={importResult}
          error={importError}
          onClose={closeImportModal}
          onImportCsv={handleImportProducts}
          onImportZip={handleImportProductsZip}
        />

        {error ? (
          <p className="pos-v2-products__error" role="alert">
            {error}
          </p>
        ) : null}
        {toast ? (
          <p
            className={`pos-v2-products__toast is-${toast.type}`}
            role="status"
          >
            {toast.message}
          </p>
        ) : null}

        <section
          className="pos-v2-products__catalog"
          aria-label="Listado de productos"
        >
          <div className="pos-v2-products__catalog-header">
            <h3>Listado</h3>

            <div className="pos-v2-products__controls">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nombre o descripción"
                aria-label="Buscar productos"
              />
              <label className="pos-v2-products__sort">
                Ordenar
                <select
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(event.target.value as SortOption)
                  }
                  aria-label="Ordenar productos"
                >
                  <option value="name-asc">Nombre A-Z</option>
                  <option value="name-desc">Nombre Z-A</option>
                  <option value="price-desc">Precio mayor a menor</option>
                  <option value="price-asc">Precio menor a mayor</option>
                </select>
              </label>

              <div
                className="pos-v2-products__view-toggle"
                role="group"
                aria-label="Cambiar vista"
              >
                <button
                  type="button"
                  className={viewMode === "grid" ? "is-active" : ""}
                  onClick={() => setViewMode("grid")}
                >
                  Cuadrícula
                </button>
                <button
                  type="button"
                  className={viewMode === "list" ? "is-active" : ""}
                  onClick={() => setViewMode("list")}
                >
                  Lista
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div
              className={`pos-v2-products__skeletons ${viewMode === "grid" ? "is-grid" : "is-list"}`}
            >
              {Array.from({ length: 6 }).map((_, index) => (
                <article
                  key={`skeleton-${index}`}
                  className="pos-v2-products__skeleton-card"
                  aria-hidden="true"
                >
                  <div className="pos-v2-products__skeleton-media" />
                  <div className="pos-v2-products__skeleton-line" />
                  <div className="pos-v2-products__skeleton-line short" />
                </article>
              ))}
            </div>
          ) : null}

          {!loading && searchingCatalog ? (
            <p className="pos-v2-products__empty">
              Buscando en todo el catálogo…
            </p>
          ) : null}
          {!loading && visibleProducts.length === 0 ? (
            <p className="pos-v2-products__empty">
              No hay productos para mostrar con los filtros actuales.
            </p>
          ) : null}

          {!loading ? (
            <div
              className={`pos-v2-products__products ${viewMode === "grid" ? "is-grid" : "is-list"}`}
            >
              {visibleProducts.map((product) => {
                const imageCandidates = [product.image, ...product.images]
                  .map((candidate) => toImageUrl(candidate))
                  .filter(Boolean) as string[];
                const uniqueImages = Array.from(new Set(imageCandidates));
                const preview = uniqueImages[0] ?? null;
                const variantsCount = Math.max(
                  product.variants.length,
                  product.variantsCount ?? 0,
                );
                const colors = Array.from(
                  new Set(
                    [
                      ...product.variants.map((variant) =>
                        variant.color?.trim(),
                      ),
                      ...product.extras
                        .filter((extra) => extra.type.toUpperCase() === "COLOR")
                        .map((extra) => extra.description.trim()),
                    ].filter(Boolean) as string[],
                  ),
                );
                const sizes = Array.from(
                  new Set(
                    [
                      ...product.variants.map((variant) =>
                        variant.size?.trim(),
                      ),
                      ...product.extras
                        .filter((extra) => extra.type.toUpperCase() === "TALLA")
                        .map((extra) => extra.description.trim()),
                    ].filter(Boolean) as string[],
                  ),
                );

                return (
                  <article
                    key={product.id}
                    className={`pos-v2-products__card ${!product.available ? "is-archived" : ""}`}
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt={product.name}
                        className="pos-v2-products__card-image"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="pos-v2-products__card-image-placeholder"
                        aria-hidden="true"
                      >
                        {product.name.slice(0, 1).toUpperCase()}
                      </div>
                    )}

                    <div className="pos-v2-products__card-content">
                      <div className="pos-v2-products__card-headline">
                        <h4>{product.name}</h4>
                        <span
                          className={product.available ? "is-ok" : "is-muted"}
                        >
                          {product.available ? "Disponible" : "Archivado"}
                        </span>
                      </div>

                      <div className="pos-v2-products__card-meta">
                        <strong>
                          {product.price == null
                            ? "--"
                            : `$${product.price.toFixed(2)}`}
                        </strong>
                        <small>Stock: {product.stock ?? "--"}</small>
                      </div>
                      {product.wholesalePrice != null ? (
                        <small className="pos-v2-products__simple-meta">
                          Mayoreo: ${product.wholesalePrice.toFixed(2)} desde{" "}
                          {product.wholesaleMinQuantity ?? "--"} pzas.
                        </small>
                      ) : null}
                      {product.categoryName ? (
                        <small className="pos-v2-products__simple-meta">
                          Categoría: {product.categoryName}
                        </small>
                      ) : null}

                      <small className="pos-v2-products__simple-meta">
                        {variantsCount > 0
                          ? `Variantes: ${variantsCount} · `
                          : ""}
                        Fotos: {uniqueImages.length}
                      </small>
                      {colors.length > 0 || sizes.length > 0 ? (
                        <small className="pos-v2-products__simple-meta">
                          {colors.length > 0
                            ? `Colores: ${colors.join(", ")}`
                            : "Colores: --"}{" "}
                          ·{" "}
                          {sizes.length > 0
                            ? `Tallas: ${sizes.join(", ")}`
                            : "Tallas: --"}
                        </small>
                      ) : null}
                    </div>

                    <div className="pos-v2-products__card-actions">
                      <button
                        type="button"
                        className="is-edit"
                        onClick={() => handleEdit(product.id)}
                      >
                        Editar
                      </button>

                      {product.available ? (
                        <button
                          type="button"
                          onClick={() =>
                            requestArchive(product.id, product.name)
                          }
                          disabled={archivingId === product.id}
                        >
                          {archivingId === product.id
                            ? "Eliminando..."
                            : "Eliminar"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="is-restore"
                          onClick={() => handleRestore(product.id)}
                          disabled={actionLoadingId === product.id}
                        >
                          {actionLoadingId === product.id
                            ? "Procesando..."
                            : "Restaurar"}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}

          {!loading &&
          visibleProducts.length > 0 &&
          search.trim().length < 2 ? (
            <nav
              className="pos-v2-products__pagination"
              aria-label="Paginación de productos"
            >
              <button
                type="button"
                onClick={() => loadProducts(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
              >
                Anterior
              </button>
              <span>
                Página {currentPage} de {totalPages} · {totalItems} productos
              </span>
              <form
                className="pos-v2-products__pagination-goto"
                onSubmit={handleGoToPage}
              >
                <label>
                  Ir a
                  <input
                    type="number"
                    min={1}
                    max={Math.max(totalPages, 1)}
                    value={pageInput}
                    onChange={(event) => setPageInput(event.target.value)}
                    aria-label="Ir a página"
                  />
                </label>
                <button type="submit" disabled={totalPages <= 1}>
                  Ir
                </button>
              </form>
              <button
                type="button"
                onClick={() =>
                  loadProducts(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage >= totalPages}
              >
                Siguiente
              </button>
            </nav>
          ) : null}
        </section>

        {isFormOpen ? (
          <div
            className="pos-v2-products__modal-backdrop"
            role="presentation"
            onClick={closeFormModal}
          >
            <section
              className="pos-v2-products__modal w-full max-h-[92vh] overflow-y-auto"
              role="dialog"
              aria-modal="true"
              aria-label="Formulario de producto"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="pos-v2-products__modal-head">
                <h3>
                  {editingId
                    ? `Editar producto #${editingId}`
                    : "Nuevo producto"}
                </h3>
                <button
                  type="button"
                  className="pos-v2-products__secondary"
                  onClick={closeFormModal}
                  aria-label="Regresar al catálogo"
                >
                  ← Regresar
                </button>
              </header>
              {saveResult ? (
                <p
                  className={`pos-v2-products__save-result is-${saveResult.type}`}
                >
                  {saveResult.message}
                </p>
              ) : null}

              <form className="pos-v2-products__form" onSubmit={handleSubmit}>
                <label>
                  Nombre
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Ej. Hamburguesa clásica"
                    required
                  />
                </label>

                <label>
                  Descripción
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Describe el producto (opcional)"
                    rows={3}
                  />
                </label>

                <fieldset
                  className="pos-v2-products__variants"
                  aria-label="Categoría de producto"
                >
                  <div className="pos-v2-products__variants-head">
                    <h4>Categoría</h4>
                    <small>
                      Selecciona una opción para clasificar el producto.
                    </small>
                  </div>
                  <div className="pos-v2-products__chips-carousel">
                    <button
                      type="button"
                      className="is-arrow"
                      onClick={() => scrollCategoryChips("left")}
                      aria-label="Desplazar categorías a la izquierda"
                    >
                      ←
                    </button>
                    <div
                      className="pos-v2-products__chips"
                      ref={categoryCarouselRef}
                    >
                      <button
                        type="button"
                        className={
                          selectedCategoryId == null ? "is-active" : ""
                        }
                        onClick={() => setSelectedCategoryId(null)}
                      >
                        Sin categoría
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          className={
                            selectedCategoryId === category.id
                              ? "is-active"
                              : ""
                          }
                          onClick={() => setSelectedCategoryId(category.id)}
                          title={category.name}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="is-arrow"
                      onClick={() => scrollCategoryChips("right")}
                      aria-label="Desplazar categorías a la derecha"
                    >
                      →
                    </button>
                  </div>
                </fieldset>

                <div className="pos-v2-products__field-grid">
                  <label>
                    Precio (opcional)
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={price}
                      onChange={(event) => setPrice(event.target.value)}
                    />
                  </label>
                  <label>
                    Precio por mayoreo
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={wholesalePrice}
                      onFocus={() => {
                        if (isFreePlan) openWholesaleUpgradeModal();
                      }}
                      onChange={(event) =>
                        handleWholesalePriceChange(event.target.value)
                      }
                      placeholder="Ej. 80"
                      readOnly={isFreePlan}
                    />
                  </label>
                  <label>
                    Cantidad mínima para mayoreo
                    <input
                      type="number"
                      min="2"
                      step="1"
                      inputMode="numeric"
                      value={wholesaleMinQuantity}
                      onFocus={() => {
                        if (isFreePlan) openWholesaleUpgradeModal();
                      }}
                      onChange={(event) =>
                        handleWholesaleMinQuantityChange(event.target.value)
                      }
                      placeholder="Ej. 3"
                      readOnly={isFreePlan}
                    />
                  </label>
                  <label>
                    Costo por producto (opcional)
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={costPerItem}
                      onChange={(event) => setCostPerItem(event.target.value)}
                    />
                  </label>

                  <label>
                    Stock (opcional)
                    <input
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      value={stock}
                      onChange={(event) => setStock(event.target.value)}
                    />
                  </label>

                  <label>
                    Color base del producto
                    <select
                      value={productColor}
                      onChange={(event) => setProductColor(event.target.value)}
                      aria-label="Color base del producto"
                      disabled={availableColorOptions.length === 0}
                    >
                      <option value="">
                        {availableColorOptions.length === 0
                          ? "Agrega colores en extras para elegir"
                          : "Sin color base"}
                      </option>
                      {availableColorOptions.map((colorOption) => (
                        <option
                          key={`product-color-${colorOption}`}
                          value={colorOption}
                        >
                          {colorOption}
                        </option>
                      ))}
                    </select>
                    <small className="pos-v2-products__hint">
                      El color base ahora se selecciona desde tus colores
                      agregados en extras.
                    </small>
                  </label>
                </div>

                <label>
                  Fotos del producto
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    onChange={handleImageInput}
                  />
                </label>

                {formImagePreviews.length > 0 ? (
                  <div
                    className="pos-v2-products__image-preview"
                    aria-label="Vista previa de fotos"
                  >
                    {formImagePreviews.map((photo, index) => (
                      <figure
                        key={photo.key}
                        className="pos-v2-products__image-card"
                      >
                        <img
                          src={photo.src}
                          alt={`Vista previa ${index + 1}`}
                          loading="lazy"
                        />
                        <button
                          type="button"
                          className="pos-v2-products__remove-photo"
                          onClick={() =>
                            photo.source === "stored"
                              ? removeStoredImage(photo.index)
                              : removeSelectedImage(photo.index)
                          }
                          aria-label={`Eliminar foto ${index + 1}`}
                        >
                          Eliminar
                        </button>
                      </figure>
                    ))}
                  </div>
                ) : null}

                <div className="pos-v2-products__toggles">
                  <label className="pos-v2-products__toggle-card">
                    <input
                      type="checkbox"
                      checked={forSale}
                      onChange={(event) => setForSale(event.target.checked)}
                    />
                    <span
                      className="pos-v2-products__switch-ui"
                      aria-hidden="true"
                    />
                    <span>A la venta</span>
                  </label>
                  <label className="pos-v2-products__toggle-card">
                    <input
                      type="checkbox"
                      checked={showInStore}
                      onChange={(event) => setShowInStore(event.target.checked)}
                    />
                    <span
                      className="pos-v2-products__switch-ui"
                      aria-hidden="true"
                    />
                    <span>Mostrar en tienda</span>
                  </label>
                  <label className="pos-v2-products__toggle-card">
                    <input
                      type="checkbox"
                      checked={showPrice}
                      onChange={(event) => setShowPrice(event.target.checked)}
                    />
                    <span
                      className="pos-v2-products__switch-ui"
                      aria-hidden="true"
                    />
                    <span>Mostrar precio</span>
                  </label>
                  <label className="pos-v2-products__toggle-card">
                    <input
                      type="checkbox"
                      checked={available}
                      onChange={(event) => setAvailable(event.target.checked)}
                    />
                    <span
                      className="pos-v2-products__switch-ui"
                      aria-hidden="true"
                    />
                    <span>Disponible</span>
                  </label>
                </div>

                <fieldset
                  className="pos-v2-products__variants"
                  aria-label="Variantes del producto"
                >
                  <div className="pos-v2-products__variants-head">
                    <h4>Variantes</h4>
                    <button type="button" onClick={addVariantDraft}>
                      + Agregar variante
                    </button>
                  </div>

                  {variants.length === 0 ? (
                    <p className="pos-v2-products__variants-empty">
                      Sin variantes por ahora.
                    </p>
                  ) : null}

                  {variants.map((variant, index) => (
                    <article
                      key={variant.key}
                      className="pos-v2-products__variant-item"
                    >
                      <div className="pos-v2-products__variant-head">
                        <strong>Variante {index + 1}</strong>
                        <button
                          type="button"
                          className="is-delete"
                          onClick={() => removeVariant(variant.key)}
                        >
                          Eliminar
                        </button>
                      </div>
                      <div className="pos-v2-products__variant-image">
                        {variant.Image ? (
                          <img
                            src={toImageUrl(variant.Image) ?? variant.Image}
                            alt={`Imagen de variante ${index + 1}`}
                            loading="lazy"
                          />
                        ) : (
                          <span>Sin imagen</span>
                        )}
                        <label className="pos-v2-products__variant-image-action">
                          {variant.imageUploading
                            ? "Subiendo..."
                            : variant.Image
                              ? "Cambiar imagen"
                              : "Agregar imagen"}
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={(event) =>
                              void handleVariantImageInput(variant.key, event)
                            }
                            disabled={variant.imageUploading || saving}
                          />
                        </label>
                        {variant.Image ? (
                          <button
                            type="button"
                            className="is-delete"
                            onClick={() => removeVariantImage(variant.key)}
                            disabled={variant.imageUploading || saving}
                          >
                            Quitar
                          </button>
                        ) : null}
                        {variant.imageError ? (
                          <small className="pos-v2-products__variant-image-error">
                            {variant.imageError}
                          </small>
                        ) : null}
                      </div>
                      <div className="pos-v2-products__variant-grid">
                        <label className="pos-v2-products__variant-field">
                          <span>Descripción</span>
                          <input
                            value={variant.description}
                            onChange={(event) =>
                              updateVariant(
                                variant.key,
                                "description",
                                event.target.value,
                              )
                            }
                            placeholder="Ej. Talla chica / Azul / 500ml"
                            aria-label={`Nombre de variante ${index + 1}`}
                          />
                        </label>

                        <label className="pos-v2-products__variant-field">
                          <span>Color de variante</span>
                          <select
                            value={variant.color}
                            onChange={(event) =>
                              updateVariant(
                                variant.key,
                                "color",
                                event.target.value,
                              )
                            }
                            aria-label={`Color de variante ${index + 1}`}
                            disabled={colors.length === 0}
                          >
                            <option value="">Selecciona color</option>
                            {colors.map((color) => (
                              <option
                                key={`${variant.key}-${color}`}
                                value={color}
                              >
                                {color}
                              </option>
                            ))}
                            {variant.color &&
                            !colors.includes(variant.color) ? (
                              <option value={variant.color}>
                                {variant.color} (actual)
                              </option>
                            ) : null}
                          </select>
                        </label>

                        <label className="pos-v2-products__variant-field">
                          <span>Código de barras</span>
                          <input
                            value={variant.barcode}
                            onChange={(event) =>
                              updateVariant(
                                variant.key,
                                "barcode",
                                event.target.value,
                              )
                            }
                            placeholder="Opcional"
                            aria-label={`Código de barras de variante ${index + 1}`}
                          />
                        </label>

                        <label className="pos-v2-products__variant-field">
                          <span>Precio</span>
                          <input
                            value={variant.price}
                            onChange={(event) =>
                              updateVariant(
                                variant.key,
                                "price",
                                event.target.value,
                              )
                            }
                            placeholder="0.00"
                            type="number"
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            aria-label={`Precio de variante ${index + 1}`}
                          />
                        </label>

                        <label className="pos-v2-products__variant-field">
                          <span>Precio de promoción</span>
                          <input
                            value={variant.promotionPrice}
                            onChange={(event) =>
                              updateVariant(
                                variant.key,
                                "promotionPrice",
                                event.target.value,
                              )
                            }
                            placeholder="0.00"
                            type="number"
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            aria-label={`Promoción de variante ${index + 1}`}
                          />
                        </label>

                        <label className="pos-v2-products__variant-field">
                          <span>Precio por mayoreo</span>
                          <input
                            value={variant.wholesalePrice}
                            onChange={(event) =>
                              updateVariant(
                                variant.key,
                                "wholesalePrice",
                                event.target.value,
                              )
                            }
                            placeholder="0.00"
                            type="number"
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            aria-label={`Precio por mayoreo de variante ${index + 1}`}
                          />
                        </label>

                        <label className="pos-v2-products__variant-field">
                          <span>Cantidad mínima para mayoreo</span>
                          <input
                            value={variant.wholesaleMinQuantity}
                            onChange={(event) =>
                              updateVariant(
                                variant.key,
                                "wholesaleMinQuantity",
                                event.target.value,
                              )
                            }
                            placeholder="Ej. 3"
                            type="number"
                            min="2"
                            step="1"
                            inputMode="numeric"
                            aria-label={`Cantidad mínima para mayoreo de variante ${index + 1}`}
                          />
                        </label>

                        <label className="pos-v2-products__variant-field">
                          <span>Costo</span>
                          <input
                            value={variant.costPerItem}
                            onChange={(event) =>
                              updateVariant(
                                variant.key,
                                "costPerItem",
                                event.target.value,
                              )
                            }
                            placeholder="0.00"
                            type="number"
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            aria-label={`Costo de variante ${index + 1}`}
                          />
                        </label>

                        <label className="pos-v2-products__variant-field">
                          <span>Stock</span>
                          <input
                            value={variant.stock}
                            onChange={(event) =>
                              updateVariant(
                                variant.key,
                                "stock",
                                event.target.value,
                              )
                            }
                            placeholder="0"
                            type="number"
                            min="0"
                            step="1"
                            inputMode="numeric"
                            aria-label={`Stock de variante ${index + 1}`}
                          />
                        </label>

                        <label className="pos-v2-products__variant-field">
                          <span>Stock mínimo</span>
                          <input
                            value={variant.minStock}
                            onChange={(event) =>
                              updateVariant(
                                variant.key,
                                "minStock",
                                event.target.value,
                              )
                            }
                            placeholder="0"
                            type="number"
                            min="0"
                            step="1"
                            inputMode="numeric"
                            aria-label={`Stock mínimo de variante ${index + 1}`}
                          />
                        </label>

                        <label className="pos-v2-products__variant-field">
                          <span>Stock óptimo</span>
                          <input
                            value={variant.optStock}
                            onChange={(event) =>
                              updateVariant(
                                variant.key,
                                "optStock",
                                event.target.value,
                              )
                            }
                            placeholder="0"
                            type="number"
                            min="0"
                            step="1"
                            inputMode="numeric"
                            aria-label={`Stock óptimo de variante ${index + 1}`}
                          />
                        </label>

                        <label className="pos-v2-products__variant-field">
                          <span>Fecha de caducidad</span>
                          <input
                            value={variant.expDate}
                            onChange={(event) =>
                              updateVariant(
                                variant.key,
                                "expDate",
                                event.target.value,
                              )
                            }
                            type="date"
                            aria-label={`Fecha de caducidad de variante ${index + 1}`}
                          />
                        </label>
                      </div>
                    </article>
                  ))}
                </fieldset>

                <fieldset
                  className="pos-v2-products__variants"
                  aria-label="Tallas y colores"
                >
                  <div className="pos-v2-products__variants-head">
                    <h4>Tallas y colores (Extras)</h4>
                  </div>

                  <div className="pos-v2-products__tag-editor">
                    <label>
                      Tallas
                      <div className="pos-v2-products__tag-input-row">
                        <input
                          value={sizeDraft}
                          onChange={(event) => setSizeDraft(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              addSizeTag();
                            }
                          }}
                          placeholder="Ej. S"
                          aria-label="Agregar talla"
                        />
                        <button type="button" onClick={addSizeTag}>
                          Agregar
                        </button>
                      </div>
                    </label>
                    <div
                      className="pos-v2-products__tag-list"
                      aria-live="polite"
                    >
                      {sizes.length === 0 ? (
                        <small>Sin tallas agregadas.</small>
                      ) : null}
                      {sizes.map((item, index) => (
                        <span
                          key={`${item}-${index}`}
                          className="pos-v2-products__tag-chip"
                        >
                          {item}
                          <button
                            type="button"
                            onClick={() => removeTag(index, setSizes)}
                            aria-label={`Quitar talla ${item}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pos-v2-products__tag-editor">
                    <label>
                      Colores
                      <div className="pos-v2-products__tag-input-row">
                        <input
                          value={colorDraft}
                          onChange={(event) =>
                            setColorDraft(event.target.value)
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              addColorTag();
                            }
                          }}
                          placeholder="Ej. Azul"
                          aria-label="Agregar color"
                        />
                        <button type="button" onClick={addColorTag}>
                          Agregar
                        </button>
                      </div>
                    </label>
                    <div
                      className="pos-v2-products__tag-list"
                      aria-live="polite"
                    >
                      {colors.length === 0 ? (
                        <small>Sin colores agregados.</small>
                      ) : null}
                      {colors.map((item, index) => (
                        <span
                          key={`${item}-${index}`}
                          className="pos-v2-products__tag-chip"
                        >
                          {item}
                          <button
                            type="button"
                            onClick={() => removeTag(index, setColors)}
                            aria-label={`Quitar color ${item}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </fieldset>

                <div className="pos-v2-products__form-actions is-modal">
                  <button
                    type="button"
                    className="pos-v2-products__secondary"
                    onClick={closeFormModal}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="pos-v2-products__primary"
                    disabled={
                      saving ||
                      variants.some((variant) => variant.imageUploading)
                    }
                  >
                    {saving
                      ? "Guardando..."
                      : variants.some((variant) => variant.imageUploading)
                        ? "Subiendo imagen..."
                        : editingId
                          ? "Guardar cambios"
                          : "Guardar producto"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        ) : null}

        {archiveDialog ? (
          <div
            className="pos-v2-products__modal-backdrop is-sheet"
            role="presentation"
            onClick={() => setArchiveDialog(null)}
          >
            <section
              className="pos-v2-products__modal pos-v2-products__modal-sheet w-full max-h-[85vh] overflow-y-auto"
              role="dialog"
              aria-modal="true"
              aria-label="Confirmar eliminación"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="pos-v2-products__modal-head">
                <h3>¿Eliminar producto?</h3>
              </header>
              <p>
                Este producto se marcará como archivado y dejará de mostrarse en
                venta activa.
              </p>
              <strong>{archiveDialog.name}</strong>
              <div className="pos-v2-products__form-actions is-modal">
                <button
                  type="button"
                  className="pos-v2-products__secondary"
                  onClick={() => setArchiveDialog(null)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="pos-v2-products__primary is-danger"
                  onClick={handleArchive}
                  disabled={archivingId === archiveDialog.id}
                >
                  {archivingId === archiveDialog.id
                    ? "Archivando..."
                    : "Sí, archivar"}
                </button>
              </div>
            </section>
          </div>
        ) : null}

        <PlanUpgradeModal
          open={Boolean(productLimitUpgrade)}
          title="Límite de productos alcanzado"
          message={`Tu plan gratuito permite hasta ${productLimitUpgrade?.limit ?? FREE_PRODUCT_LIMIT} productos. Actualmente tienes ${productLimitUpgrade?.currentCount ?? productLimitCount} producto(s) activos. Actualiza a START para agregar más productos a tu catálogo.`}
          requiredPlan={productLimitUpgrade?.requiredPlan ?? "START"}
          ctaLabel="Actualizar a START"
          onClose={closeProductLimitUpgradeModal}
          onUpgrade={openProductPlanCheckout}
        />

        <FeatureUnlockModal
          open={Boolean(productPlanUnlockModal)}
          onClose={() => setProductPlanUnlockModal(null)}
          title={productPlanUnlockModal?.title}
          message={productPlanUnlockModal?.message}
          buttonText={productPlanUnlockModal?.buttonText}
          unlockFeature={productPlanUnlockModal?.unlockFeature}
          onPaymentSuccess={() => {
            setProductPlanUnlockModal(null);
            void loadProducts(currentPage);
          }}
        />

        <FeatureUnlockModal
          open={showPosFeatureUnlock}
          onClose={() => setShowPosFeatureUnlock(false)}
          title="Desbloquea esta función"
          message="Esta función está bloqueada en tu plan actual. Desbloquéala contratando un plan para usarla sin límites."
          buttonText="Desbloquear ahora"
          unlockFeature="Pos"
        />

        {showCategoryManager ? (
          <div
            className="pos-v2-products__modal-backdrop"
            role="presentation"
            onClick={() => setShowCategoryManager(false)}
          >
            <section
              className="pos-v2-products__modal pos-v2-products__modal--compact w-full max-h-[90vh] overflow-y-auto"
              role="dialog"
              aria-modal="true"
              aria-label="Gestión de categorías"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="pos-v2-products__modal-head">
                <h3>Gestionar categorías</h3>
                <button
                  type="button"
                  className="pos-v2-products__secondary"
                  onClick={() => setShowCategoryManager(false)}
                  aria-label="Regresar al catálogo"
                >
                  ← Regresar
                </button>
              </header>
              <p className="pos-v2-products__hint">
                Completa los campos para crear o editar categorías. El nombre es
                obligatorio y el color ayuda a reconocerlas rápidamente.
              </p>

              {editingCategoryId ? (
                <p className="pos-v2-products__inline-success">
                  Editando categoría #{editingCategoryId}. Guarda cambios o
                  cancela edición.
                </p>
              ) : null}

              <div className="pos-v2-products__field-grid pos-v2-products__category-form-grid">
                <label>
                  Nombre categoría <span aria-hidden="true">*</span>
                  <input
                    ref={categoryNameInputRef}
                    className="pos-v2-products__category-name-input"
                    value={categoryNameInput}
                    onChange={(event) => {
                      setCategoryNameInput(event.target.value);
                      setCategoryFormErrors((current) => ({
                        ...current,
                        name: undefined,
                      }));
                    }}
                    placeholder="Ej. Bebidas frías · 2 a 50 caracteres"
                    maxLength={50}
                    required
                    aria-invalid={Boolean(categoryFormErrors.name)}
                  />
                  <div className="pos-v2-products__field-meta">
                    <small className="pos-v2-products__hint">
                      Nombre visible en el catálogo y en filtros de ventas.
                    </small>
                    <small className="pos-v2-products__char-count">
                      {categoryNameInput.trim().length}/50
                    </small>
                  </div>
                  {categoryFormErrors.name ? (
                    <small
                      className="pos-v2-products__field-error"
                      role="alert"
                    >
                      {categoryFormErrors.name}
                    </small>
                  ) : null}
                </label>
                <label>
                  Color identificador
                  <div className="pos-v2-products__color-picker-wrap">
                    <input
                      type="color"
                      value={categoryColorInput}
                      onChange={(event) => {
                        setCategoryColorInput(event.target.value);
                        setCategoryFormErrors((current) => ({
                          ...current,
                          color: undefined,
                        }));
                      }}
                      aria-invalid={Boolean(categoryFormErrors.color)}
                    />
                    <small>{categoryColorInput.toUpperCase()}</small>
                  </div>
                  {categoryFormErrors.color ? (
                    <small
                      className="pos-v2-products__field-error"
                      role="alert"
                    >
                      {categoryFormErrors.color}
                    </small>
                  ) : null}
                </label>
              </div>
              <div
                className="pos-v2-products__category-preview"
                aria-live="polite"
              >
                <span
                  className="pos-v2-products__category-dot"
                  style={{ backgroundColor: categoryColorInput }}
                  aria-hidden="true"
                />
                <strong>
                  {categoryNameInput.trim() || "Vista previa de categoría"}
                </strong>
              </div>
              <div className="pos-v2-products__form-actions">
                <button
                  type="button"
                  className="pos-v2-products__secondary"
                  onClick={resetCategoryForm}
                >
                  {editingCategoryId ? "Cancelar edición" : "Limpiar"}
                </button>
                <button
                  type="button"
                  className="pos-v2-products__primary"
                  onClick={saveCategory}
                  disabled={!isCategoryFormReady}
                >
                  {editingCategoryId ? "Guardar cambios" : "Crear categoría"}
                </button>
              </div>

              <label className="pos-v2-products__category-search">
                Buscar categoría
                <input
                  value={categorySearch}
                  onChange={(event) => setCategorySearch(event.target.value)}
                  placeholder="Nombre o color"
                />
              </label>

              <div className="pos-v2-products__category-list">
                {categories.length === 0 ? (
                  <p className="pos-v2-products__variants-empty">
                    Aún no hay categorías.
                  </p>
                ) : null}
                {categories.length > 0 && visibleCategories.length === 0 ? (
                  <p className="pos-v2-products__variants-empty">
                    No hay coincidencias para tu búsqueda.
                  </p>
                ) : null}
                {visibleCategories.map((category) => (
                  <article
                    key={category.id}
                    className={`pos-v2-products__category-item ${editingCategoryId === category.id ? "is-editing" : ""}`}
                  >
                    <div className="pos-v2-products__category-info">
                      <span
                        className="pos-v2-products__category-dot"
                        style={{ backgroundColor: category.color }}
                        aria-hidden="true"
                      />
                      <div>
                        <strong>{category.name}</strong>
                        <small>{category.color}</small>
                      </div>
                    </div>
                    <div className="pos-v2-products__card-actions pos-v2-products__category-actions">
                      <button
                        type="button"
                        className="is-edit"
                        onClick={() => editCategory(category)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCategory(category.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        ) : null}
      </section>
    </PosV2Shell>
  );
};
