import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiSearch, FiShoppingCart, FiSliders, FiX } from "react-icons/fi";
import { getPosApiBaseUrl } from "../../../pos/shared/config/posEnv";
import { CatalogStorefrontApi, StorefrontCategory, StorefrontVariant } from "../api/CatalogStorefrontApi";
import { CatalogStorefrontExperiencePage } from "../pages/CatalogStorefrontExperiencePage";
import { CatalogStorefrontService } from "../services/CatalogStorefrontService";
import { StorefrontBusiness, StorefrontCartItem, StorefrontProduct } from "../model/CatalogStorefrontModels";
import { StorefrontProductGrid } from "./StorefrontProductGrid";
import { VariantSelectionModalV2 } from "./VariantSelectionModalV2";
import "./CatalogStorefrontPage.css";

const money = (value: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 }).format(value);

const SkeletonGrid = () => (
  <div className="catalog-v2-grid" aria-hidden="true">
    {Array.from({ length: 8 }).map((_, index) => (
      <article key={index} className="catalog-v2-grid__skeleton" />
    ))}
  </div>
);

export const CatalogStorefrontPage = () => {
  const navigate = useNavigate();
  const { businessId = "" } = useParams<{ businessId: string }>();
  const [store, setStore] = useState<StorefrontBusiness | null>(null);
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
  const maxBound = 999;
  const [priceMin, setPriceMin] = useState(minBound);
  const [priceMax, setPriceMax] = useState(maxBound);
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [variantProduct, setVariantProduct] = useState<StorefrontProduct | null>(null);
  const [variantOptions, setVariantOptions] = useState<StorefrontVariant[]>([]);

  const pageLogic = useMemo(() => {
    const repository = new CatalogStorefrontApi(getPosApiBaseUrl());
    const service = new CatalogStorefrontService(repository);
    return new CatalogStorefrontExperiencePage(service);
  }, []);

  useEffect(() => {
    setPage(1);
    setPageInput("1");
    setSelectedCategoryId(null);
  }, [businessId]);

  useEffect(() => {
    const run = async () => {
      if (!businessId) {
        setError("No encontramos el negocio solicitado.");
        return;
      }

      try {
        const [business, categoriesResponse] = await pageLogic.loadBusinessContext(businessId);
        setStore(business);
        setCategories(categoriesResponse);
        window.localStorage.setItem("catalog-v2-store-name", business?.name ?? "Catálogo");
        window.localStorage.setItem("idBusiness", businessId);
        window.localStorage.setItem("telefono", business?.phone ?? "");
      } catch {
        setError("No fue posible cargar la información del negocio.");
      }
    };

    void run();
  }, [businessId, pageLogic]);

  useEffect(() => {
    const run = async () => {
      if (!businessId) return;

      setLoading(true);
      setError(null);
      try {
        const productsPage = await pageLogic.loadProducts(businessId, page, selectedCategoryId);
        setProducts(productsPage.products);
        setTotalPages(productsPage.pagination.totalPages);
      } catch {
        setError("No fue posible cargar el catálogo digital.");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [businessId, page, pageLogic, selectedCategoryId]);

  useEffect(() => {
    if (!businessId) return;
    const saved = window.localStorage.getItem(`catalog-v2-cart:${businessId}`);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as StorefrontCartItem[];
      if (Array.isArray(parsed)) setCart(parsed);
    } catch {
      // ignore
    }
  }, [businessId]);

  useEffect(() => {
    if (!businessId) return;
    window.localStorage.setItem(`catalog-v2-cart:${businessId}`, JSON.stringify(cart));
  }, [businessId, cart]);

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => setToast(null), 1600);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const addToCart = (product: StorefrontProduct) => {
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

  const cartQuantityMap = useMemo(
    () =>
      cart.reduce<Record<number, number>>((acc, item) => {
        acc[item.productId] = item.quantity;
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
    const variants = await pageLogic.loadVariants(product.id);
    if (!variants.length) return;
    setVariantProduct(product);
    setVariantOptions(variants);
    setVariantModalOpen(true);
  };

  const addVariantToCart = (variant: StorefrontVariant, quantity: number, buyNow: boolean) => {
    if (!variantProduct) return;
    const syntheticId = Number(`${variantProduct.id}${variant.id}`);
    const variantPrice = variant.promotionPrice && variant.promotionPrice > 0 ? variant.promotionPrice : variant.price;

    setCart((current) => {
      const existing = current.find((item) => item.productId === syntheticId);
      if (existing) {
        return current.map((item) =>
          item.productId === syntheticId ? { ...item, quantity: item.quantity + quantity } : item,
        );
      }
      return [
        ...current,
        {
          productId: syntheticId,
          name: `${variantProduct.name} · ${variant.description}`,
          price: variantPrice,
          quantity,
          image: variantProduct.image,
        },
      ];
    });

    setVariantModalOpen(false);
    setVariantProduct(null);
    setVariantOptions([]);
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

      <section className="catalog-v2__tools" aria-label="Búsqueda de productos">
        <div className="catalog-v2__search-wrap">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Busca un producto"
            aria-label="Buscar producto"
          />
          <FiSearch />
        </div>
        <button type="button" className="catalog-v2__filter-btn" onClick={() => setShowFilters(true)} aria-label="Abrir filtros">
          <FiSliders />
        </button>
      </section>

      <section className="catalog-v2__categories" aria-label="Categorías de catálogo">
        <button
          type="button"
          className={`catalog-v2__category-chip ${selectedCategoryId === null ? "is-active" : ""}`}
          onClick={() => handleSelectCategory(null)}
        >
          Todo
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={`catalog-v2__category-chip ${selectedCategoryId === category.id ? "is-active" : ""}`}
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
        <nav className="catalog-v2__pagination" aria-label="Paginación de catálogo">
          <button type="button" onClick={() => changePage(page - 1)} disabled={page === 1}>
            Anterior
          </button>
          <span>Página {page} de {totalPages}</span>
          <div className="catalog-v2__pagination-jump">
            <input
              type="text"
              inputMode="numeric"
              value={pageInput}
              onChange={(event) => setPageInput(event.target.value.replace(/[^\d]/g, ""))}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  changePage(Number(pageInput || page));
                }
              }}
              aria-label="Ir a la página"
            />
            <button type="button" onClick={() => changePage(Number(pageInput || page))}>Ir</button>
          </div>
          <button
            type="button"
            onClick={() => changePage(page + 1)}
            disabled={page === totalPages}
          >
            Siguiente
          </button>
        </nav>
      ) : null}


      {showFilters ? (
        <div className="catalog-v2-filters__backdrop">
          <aside className="catalog-v2-filters">
            <button type="button" className="catalog-v2-filters__close" onClick={() => setShowFilters(false)} aria-label="Cerrar filtros">
              <FiX />
            </button>
            <h3>Filtros</h3>
            <label className="catalog-v2-filters__check"><input type="checkbox" checked={sortMode === "asc"} onChange={() => setSortMode((value) => value === "asc" ? "none" : "asc")} /><span>Precio de menor a mayor</span></label>
            <label className="catalog-v2-filters__check"><input type="checkbox" checked={sortMode === "desc"} onChange={() => setSortMode((value) => value === "desc" ? "none" : "desc")} /><span>Precio de mayor a menor</span></label>
            <div className="catalog-v2-filters__range">
              <p>Rango de precios</p>
              <div className="catalog-v2-filters__range-legend">
                <span>${minBound}</span>
                <span>${maxBound}</span>
              </div>
              <div>
                <label>Mínimo<input type="number" value={priceMin} onChange={(e) => setPriceMin(Math.max(minBound, Math.min(Number(e.target.value || minBound), priceMax)))} /></label>
                <label>Máximo<input type="number" value={priceMax} onChange={(e) => setPriceMax(Math.min(maxBound, Math.max(Number(e.target.value || maxBound), priceMin)))} /></label>
              </div>
              <input type="range" min={minBound} max={maxBound} value={priceMin} onChange={(e) => setPriceMin(Math.min(Number(e.target.value), priceMax))} aria-label="Precio mínimo" />
              <input type="range" min={minBound} max={maxBound} value={priceMax} onChange={(e) => setPriceMax(Math.max(Number(e.target.value), priceMin))} aria-label="Precio máximo" />
            </div>
            <div className="catalog-v2-filters__actions">
              <button type="button" onClick={() => { setSortMode("none"); setPriceMin(minBound); setPriceMax(maxBound); }}>Limpiar</button>
              <button type="button" onClick={() => setShowFilters(false)}>Aplicar</button>
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
        formatPrice={money}
        onClose={() => setVariantModalOpen(false)}
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
