import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiSearch, FiShoppingCart, FiSliders, FiX } from "react-icons/fi";
import { getPosApiBaseUrl } from "../../../pos/shared/config/posEnv";
import { CatalogStorefrontApi, StorefrontCategory, StorefrontProductExtra, StorefrontVariant } from "../api/CatalogStorefrontApi";
import { CatalogStorefrontExperiencePage } from "../pages/CatalogStorefrontExperiencePage";
import { CatalogStorefrontService } from "../services/CatalogStorefrontService";
import { StorefrontBusiness, StorefrontCartItem, StorefrontProduct } from "../model/CatalogStorefrontModels";
import { StorefrontProductGrid } from "./StorefrontProductGrid";
import { VariantSelectionModalV2 } from "./VariantSelectionModalV2";
import "./CatalogStorefrontPage.css";
import { useCatalogThemeSync } from "./useCatalogThemeSync";

const money = (value: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 }).format(value);
const DEFAULT_PRICE_MAX_BOUND = 999;

const SkeletonGrid = () => (
  <div className="catalog-v2-grid" aria-hidden="true">
    {Array.from({ length: 8 }).map((_, index) => (
      <article key={index} className="catalog-v2-grid__skeleton" />
    ))}
  </div>
);

const isCatalogDebugEnabled = () => {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("catalog-v2-debug") === "1" || new URLSearchParams(window.location.search).get("catalogDebug") === "1";
};

const logCatalogDebug = (scope: string, payload: Record<string, unknown>) => {
  if (!isCatalogDebugEnabled()) return;
  console.info(`[catalog-v2][${scope}]`, payload);
};

export const CatalogStorefrontPage = () => {
  useCatalogThemeSync();
  const navigate = useNavigate();
  const { businessId = "" } = useParams<{ businessId: string }>();
  const [store, setStore] = useState<StorefrontBusiness | null>(null);
  const [planLimit, setPlanLimit] = useState<string | undefined>(undefined);
  const [businessContextLoaded, setBusinessContextLoaded] = useState(false);
  const [categories, setCategories] = useState<StorefrontCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [products, setProducts] = useState<StorefrontProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<StorefrontCartItem[]>([]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortMode, setSortMode] = useState<"none" | "asc" | "desc">("none");
  const minBound = 0;
  const [priceCeiling, setPriceCeiling] = useState(DEFAULT_PRICE_MAX_BOUND);
  const [priceMin, setPriceMin] = useState(minBound);
  const [priceMax, setPriceMax] = useState(DEFAULT_PRICE_MAX_BOUND);
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [variantProduct, setVariantProduct] = useState<StorefrontProduct | null>(null);
  const [variantOptions, setVariantOptions] = useState<StorefrontVariant[]>([]);
  const [colorOptions, setColorOptions] = useState<StorefrontProductExtra[]>([]);
  const [sizeOptions, setSizeOptions] = useState<StorefrontProductExtra[]>([]);
  const [cartReady, setCartReady] = useState(false);
  const businessContextRequestRef = useRef(0);

  const pageLogic = useMemo(() => {
    const repository = new CatalogStorefrontApi(getPosApiBaseUrl());
    const service = new CatalogStorefrontService(repository);
    return new CatalogStorefrontExperiencePage(service);
  }, []);

  useEffect(() => {
    setPage(1);
    setPageInput("1");
    setSelectedCategoryId(null);
    setPriceMin(minBound);
    setPriceMax(DEFAULT_PRICE_MAX_BOUND);
    setPriceCeiling(DEFAULT_PRICE_MAX_BOUND);
  }, [businessId]);

  useEffect(() => {
    const highestPrice = products.reduce((maxValue, product) => {
      const productPrice = product.promotionPrice && product.promotionPrice > 0 ? product.promotionPrice : product.price;
      return Math.max(maxValue, productPrice);
    }, 0);
    const nextCeiling = Math.max(DEFAULT_PRICE_MAX_BOUND, Math.ceil(highestPrice));
    setPriceCeiling(nextCeiling);
    setPriceMax((current) => (current >= priceCeiling || current === DEFAULT_PRICE_MAX_BOUND ? nextCeiling : current));
  }, [priceCeiling, products]);

  useEffect(() => {
    if (!businessId) return;
    void pageLogic.registerVisit(businessId);
  }, [businessId, pageLogic]);

  useEffect(() => {
    businessContextRequestRef.current += 1;

    const run = async () => {
      if (!businessId) {
        setError("No encontramos el negocio solicitado.");
        return;
      }

      const requestId = businessContextRequestRef.current;

      try {
        const [business, categoriesResponse] = await pageLogic.loadBusinessContext(businessId);

        if (requestId !== businessContextRequestRef.current) return;

        logCatalogDebug("business-context:resolved", {
          businessId,
          requestId,
          hasBusiness: Boolean(business),
          plan: business?.plan ?? null,
          categoriesCount: categoriesResponse.length,
        });

        setStore(business);
        setCategories(categoriesResponse);
        setPlanLimit(business?.plan?.trim() || undefined);
        window.localStorage.setItem("catalog-v2-store-name", business?.name ?? "Catálogo");
        window.localStorage.setItem("idBusiness", businessId);
        window.localStorage.setItem("telefono", business?.phone ?? "");
      } catch {
        if (requestId !== businessContextRequestRef.current) return;
        setError("No fue posible cargar la información del negocio.");
      } finally {
        if (requestId !== businessContextRequestRef.current) return;
        setBusinessContextLoaded(true);
      }
    };

    void run();
  }, [businessId, pageLogic]);

  useEffect(() => {
    if (!businessContextLoaded || !businessId) return;

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        logCatalogDebug("products:load:start", { businessId, page, selectedCategoryId, planLimit: planLimit ?? null });
        const productsPage = await pageLogic.loadProducts(businessId, page, selectedCategoryId, planLimit);
        if (cancelled) return;
        setProducts(productsPage.products);
        setTotalPages(productsPage.pagination.totalPages);
        logCatalogDebug("products:load:success", {
          businessId,
          page,
          selectedCategoryId,
          planLimit: planLimit ?? null,
          productCount: productsPage.products.length,
          totalPages: productsPage.pagination.totalPages,
        });
      } catch {
        if (cancelled) return;
        setError("No fue posible cargar el catálogo digital.");
        logCatalogDebug("products:load:error", { businessId, page, selectedCategoryId, planLimit: planLimit ?? null });
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [businessContextLoaded, businessId, page, pageLogic, selectedCategoryId, planLimit]);

  useEffect(() => {
    if (!businessId) return;
    const saved = window.localStorage.getItem(`catalog-v2-cart:${businessId}`);
    if (!saved) {
      setCart([]);
      setCartReady(true);
      return;
    }
    try {
      const parsed = JSON.parse(saved) as StorefrontCartItem[];
      if (Array.isArray(parsed)) setCart(parsed);
      else setCart([]);
    } catch {
      setCart([]);
    } finally {
      setCartReady(true);
    }
  }, [businessId]);

  useEffect(() => {
    if (!businessId || !cartReady) return;
    window.localStorage.setItem(`catalog-v2-cart:${businessId}`, JSON.stringify(cart));
  }, [businessId, cart, cartReady]);

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => setToast(null), 1600);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const addToCart = async (product: StorefrontProduct) => {
    const [variants, extras] = await Promise.all([pageLogic.loadVariants(product.id), pageLogic.loadExtras(product.id)]);
    if (variants.length > 0 || extras.colors.length > 0 || extras.sizes.length > 0) {
      setVariantProduct(product);
      setVariantOptions(variants);
      setColorOptions(extras.colors);
      setSizeOptions(extras.sizes);
      setVariantModalOpen(true);
      return;
    }

    setCart((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) {
        return current.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...current, { productId: product.id, name: product.name, price: product.price, quantity: 1, image: product.image }];
    });
    setToast("Producto agregado al carrito");
  };

  const removeFromCart = (product: StorefrontProduct) => {
    setCart((current) => current.filter((item) => item.productId !== product.id));
    setToast("Producto eliminado del carrito");
  };

  const decrementFromCart = (product: StorefrontProduct) => {
    setCart((current) =>
      current
        .map((item) => (item.productId === product.id ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item))
        .filter((item) => item.quantity > 0),
    );
  };

  const setProductQuantity = (product: StorefrontProduct, quantity: number) => {
    const safeQuantity = Math.max(1, Math.min(999, quantity));
    setCart((current) =>
      current.map((item) => (item.productId === product.id ? { ...item, quantity: safeQuantity } : item)),
    );
  };

  const cartQuantityMap = useMemo(
    () =>
      cart.reduce<Record<number, number>>((acc, item) => {
        acc[item.productId] = (acc[item.productId] ?? 0) + item.quantity;
        return acc;
      }, {}),
    [cart],
  );

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const normalizedSearch = search.trim().toLowerCase();
  const filteredProducts = useMemo(() => {
    const base = normalizedSearch.length === 0
      ? products
      : products.filter((product) => `${product.name} ${product.description}`.toLowerCase().includes(normalizedSearch));

    const inRange = base.filter((product) => {
      const price = product.promotionPrice && product.promotionPrice > 0 ? product.promotionPrice : product.price;
      return price >= priceMin && price <= priceMax;
    });

    if (sortMode === "none") return inRange;

    return [...inRange].sort((a, b) => {
      const aPrice = a.promotionPrice && a.promotionPrice > 0 ? a.promotionPrice : a.price;
      const bPrice = b.promotionPrice && b.promotionPrice > 0 ? b.promotionPrice : b.price;
      return sortMode === "asc" ? aPrice - bPrice : bPrice - aPrice;
    });
  }, [normalizedSearch, products, priceMax, priceMin, sortMode]);

  const handleQuickView = async (product: StorefrontProduct) => {
    const [variants, extras] = await Promise.all([pageLogic.loadVariants(product.id), pageLogic.loadExtras(product.id)]);
    if (!variants.length && !extras.colors.length && !extras.sizes.length) return;
    setVariantProduct(product);
    setVariantOptions(variants);
    setColorOptions(extras.colors);
    setSizeOptions(extras.sizes);
    setVariantModalOpen(true);
  };

  const addVariantToCart = ({ variant, color, size, quantity, buyNow }: { variant: StorefrontVariant | null; color: StorefrontProductExtra | null; size: StorefrontProductExtra | null; quantity: number; buyNow: boolean }) => {
    if (!variantProduct) return;
    const hasVariants = variantOptions.length > 0;
    const isBaseProduct = !hasVariants || variant == null;
    const cartKey = [variantProduct.id, variant?.id ?? "base", color?.id ?? "nc", size?.id ?? "ns"].join("-");
    const productIdToStore = variantProduct.id;
    const selectedPrice = isBaseProduct
      ? (variantProduct.promotionPrice && variantProduct.promotionPrice > 0 ? variantProduct.promotionPrice : variantProduct.price)
      : (variant.promotionPrice && variant.promotionPrice > 0 ? variant.promotionPrice : variant.price);
    const selectedCost = variant?.costPerItem ?? undefined;
    const selectedName = [
      isBaseProduct ? variantProduct.name : `${variantProduct.name} · ${variant.description}`,
      color?.description ? `Color: ${color.description}` : "",
      size?.description ? `Talla: ${size.description}` : "",
    ].filter(Boolean).join(" · ");

    const existing = cart.find((item) => (item.cartKey ?? String(item.productId)) === cartKey);
    const nextCart = existing
      ? cart.map((item) =>
        (item.cartKey ?? String(item.productId)) === cartKey ? { ...item, quantity: item.quantity + quantity } : item,
      )
      : [
        ...cart,
        {
          cartKey,
          productId: productIdToStore,
          variantId: variant?.id,
          colorId: color?.id,
          sizeId: size?.id,
          colorName: color?.description,
          sizeName: size?.description,
          name: selectedName,
          price: selectedPrice,
          cost: selectedCost,
          quantity,
          image: variantProduct.image,
        },
      ];

    setCart(nextCart);
    if (businessId) {
      window.localStorage.setItem(`catalog-v2-cart:${businessId}`, JSON.stringify(nextCart));
    }

    setVariantModalOpen(false);
    setVariantProduct(null);
    setVariantOptions([]);
    setColorOptions([]);
    setSizeOptions([]);
    setToast("Variante agregada al carrito");

    if (buyNow) {
      navigate("/v2/catalogo/pedido");
    }
  };

  const productsWithImage = useMemo(
    () => filteredProducts.filter((product) => Boolean(product.image && product.image.trim().length > 0)),
    [filteredProducts],
  );
  const handleSelectCategory = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setPage(1);
    setPageInput("1");
  };

  const changePage = (nextPage: number) => {
    const safePage = Math.min(totalPages, Math.max(1, nextPage));
    setPage(safePage);
    setPageInput(String(safePage));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="catalog-v2">
      <header className="catalog-v2__header">
        <h1>{store?.name || "Catálogo digital"}</h1>
        <Link to="/v2/catalogo/pedido" className="catalog-v2__cart-link" aria-label="Ver carrito">
          <FiShoppingCart />
          {totalItems > 0 ? <span>{totalItems}</span> : null}
        </Link>
      </header>

      <section className="flex gap-2" aria-label="Búsqueda de productos">
        <div className="relative flex-1">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Busca un producto"
            aria-label="Buscar producto"
            className="w-full min-h-[46px] rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] px-4 pr-10 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20"
          />
          <FiSearch className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xl" />
        </div>
        <button
          type="button"
          className="grid h-[46px] w-[46px] place-items-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--text-primary)]"
          onClick={() => setShowFilters(true)}
          aria-label="Abrir filtros"
        >
          <FiSliders />
        </button>
      </section>

      <section className="flex gap-3 overflow-x-auto py-1" aria-label="Categorías de catálogo">
        <button
          type="button"
          className={`whitespace-nowrap border-b-2 bg-transparent pb-1 text-sm ${selectedCategoryId === null
            ? "border-[var(--text-primary)] text-[var(--text-primary)] font-semibold"
            : "border-transparent text-[var(--text-muted)]"
            }`}
          onClick={() => handleSelectCategory(null)}
        >
          Todo
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={`whitespace-nowrap border-b-2 bg-transparent pb-1 text-sm ${selectedCategoryId === category.id
              ? "border-[var(--text-primary)] text-[var(--text-primary)] font-semibold"
              : "border-transparent text-[var(--text-muted)]"
              }`}
            onClick={() => handleSelectCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </section>

      {error ? <p className="catalog-v2__error">{error}</p> : null}
      {toast ? <p className="catalog-v2__toast">{toast}</p> : null}

      <section aria-label="Productos del catálogo">
        {loading ? (
          <SkeletonGrid />
        ) : (
          <StorefrontProductGrid
            products={productsWithImage}
            onAdd={addToCart}
            onRemove={removeFromCart}
            onDecrement={decrementFromCart}
            onSetQuantity={setProductQuantity}
            onQuickView={handleQuickView}
            existingQuantities={cartQuantityMap}
            formatPrice={money}
            phone={store?.phone ?? null}
          />
        )}
        {!loading && productsWithImage.length === 0 ? (
          <p className="catalog-v2__empty">No encontramos productos con ese filtro.</p>
        ) : null}
      </section>

      {!loading && totalPages > 1 ? (
        <nav
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-2"
          aria-label="Paginación de catálogo"
        >
          <button
            type="button"
            className="min-h-9 rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] px-3 text-sm font-semibold text-[var(--text-primary)] disabled:opacity-45"
            onClick={() => changePage(page - 1)}
            disabled={page === 1}
          >
            Anterior
          </button>
          <span className="text-sm text-[var(--text-secondary)]">Página {page} de {totalPages}</span>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              inputMode="numeric"
              value={pageInput}
              className="h-9 w-14 rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] text-center text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20"
              onChange={(event) => setPageInput(event.target.value.replace(/[^\d]/g, ""))}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  changePage(Number(pageInput || page));
                }
              }}
              aria-label="Ir a la página"
            />
            <button
              type="button"
              className="min-h-9 rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] px-3 text-sm font-semibold text-[var(--text-primary)]"
              onClick={() => changePage(Number(pageInput || page))}
            >
              Ir
            </button>
          </div>
          <button
            type="button"
            className="min-h-9 rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] px-3 text-sm font-semibold text-[var(--text-primary)] disabled:opacity-45"
            onClick={() => changePage(page + 1)}
            disabled={page === totalPages}
          >
            Siguiente
          </button>
        </nav>
      ) : null}


      {showFilters ? (
        <div className="fixed inset-0 z-40 grid bg-black/55">
          <aside className="ml-auto grid h-full w-full max-w-[390px] content-start gap-4 overflow-y-auto border-l border-[var(--border-default)] bg-[var(--bg-surface)] p-4 text-[var(--text-primary)] sm:max-w-[420px] max-sm:mt-auto max-sm:h-auto max-sm:max-w-full max-sm:rounded-t-2xl max-sm:border-l-0 max-sm:border-t">
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-full text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
              onClick={() => setShowFilters(false)}
              aria-label="Cerrar filtros"
            >
              <FiX />
            </button>
            <h3 className="text-3xl font-bold leading-none">Filtros</h3>
            <label className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] px-3 py-2">
              <span className="text-sm font-medium text-[var(--text-secondary)]">Precio de menor a mayor</span>
              <input type="checkbox" checked={sortMode === "asc"} onChange={() => setSortMode((value) => value === "asc" ? "none" : "asc")} className="h-5 w-5 shrink-0 rounded accent-[var(--text-primary)]" />
            </label>
            <label className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] px-3 py-2">
              <span className="text-sm font-medium text-[var(--text-secondary)]">Precio de mayor a menor</span>
              <input type="checkbox" checked={sortMode === "desc"} onChange={() => setSortMode((value) => value === "desc" ? "none" : "desc")} className="h-5 w-5 shrink-0 rounded accent-[var(--text-primary)]" />
            </label>
            <div className="space-y-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-subtle)] p-3">
              <p className="text-xl font-bold">Rango de precios</p>
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>${minBound}</span>
                <span>${priceCeiling}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 max-sm:grid-cols-1">
                <label className="grid min-w-0 gap-1 text-xs font-medium text-[var(--text-secondary)]">Mínimo
                  <input className="h-11 w-full min-w-0 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20" type="number" value={priceMin} onChange={(e) => setPriceMin(Math.max(minBound, Math.min(Number(e.target.value || minBound), priceMax)))} />
                </label>
                <label className="grid min-w-0 gap-1 text-xs font-medium text-[var(--text-secondary)]">Máximo
                  <input className="h-11 w-full min-w-0 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20" type="number" value={priceMax} onChange={(e) => setPriceMax(Math.min(priceCeiling, Math.max(Number(e.target.value || priceCeiling), priceMin)))} />
                </label>
              </div>
              <input className="w-full accent-[var(--text-primary)]" type="range" min={minBound} max={priceCeiling} value={priceMin} onChange={(e) => setPriceMin(Math.min(Number(e.target.value), priceMax))} aria-label="Precio mínimo" />
              <input className="w-full accent-[var(--text-primary)]" type="range" min={minBound} max={priceCeiling} value={priceMax} onChange={(e) => setPriceMax(Math.max(Number(e.target.value), priceMin))} aria-label="Precio máximo" />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 max-sm:grid-cols-1">
              <button className="min-h-11 rounded-full border border-[var(--border-default)] bg-[var(--bg-subtle)] text-sm font-semibold text-[var(--text-primary)]" type="button" onClick={() => { setSortMode("none"); setPriceMin(minBound); setPriceMax(priceCeiling); }}>Limpiar</button>
              <button className="min-h-11 rounded-full bg-[var(--text-primary)] text-sm font-semibold text-[var(--text-inverse)]" type="button" onClick={() => setShowFilters(false)}>Aplicar</button>
            </div>
          </aside>
        </div>
      ) : null}

      <VariantSelectionModalV2
        open={variantModalOpen}
        productName={variantProduct?.name ?? "Variantes"}
        productImage={variantProduct?.image}
        productBasePrice={variantProduct?.price}
        variants={variantOptions}
        colors={colorOptions}
        sizes={sizeOptions}
        formatPrice={money}
        onClose={() => {
          setVariantModalOpen(false);
          setVariantProduct(null);
          setVariantOptions([]);
          setColorOptions([]);
          setSizeOptions([]);
        }}
        onConfirm={addVariantToCart}
      />

      {totalItems > 0 ? (
        <Link to="/v2/catalogo/pedido" className="catalog-v2__cart-fab">
          Ver carrito ({totalItems}) · {money(total)}
        </Link>
      ) : null}
    </main>
  );
};
