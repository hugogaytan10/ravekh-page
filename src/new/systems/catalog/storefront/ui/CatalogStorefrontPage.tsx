import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPosApiBaseUrl } from "../../../pos/shared/config/posEnv";
import { CatalogStorefrontApi, StorefrontCategory } from "../api/CatalogStorefrontApi";
import { CatalogStorefrontExperiencePage } from "../pages/CatalogStorefrontExperiencePage";
import { CatalogStorefrontService } from "../services/CatalogStorefrontService";
import { StorefrontBusiness, StorefrontCartItem, StorefrontProduct } from "../model/CatalogStorefrontModels";
import { StorefrontProductGrid } from "./StorefrontProductGrid";
import { VariantSelectionModalV2 } from "./VariantSelectionModalV2";
import "./CatalogStorefrontPage.css";

const money = (value: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 }).format(value);

const formatWhatsappText = (storeName: string, items: StorefrontCartItem[], total: number) => {
  const lines = items.map((item) => `• ${item.name} x${item.quantity} — ${money(item.price * item.quantity)}`);
  return [`Hola, quiero pedir en *${storeName}*:`, ...lines, ``, `*Total:* ${money(total)}`].join("\n");
};

const SkeletonGrid = () => (
  <div className="catalog-v2-grid" aria-hidden="true">
    {Array.from({ length: 8 }).map((_, index) => (
      <article key={index} className="catalog-v2-grid__skeleton" />
    ))}
  </div>
);

export const CatalogStorefrontPage = () => {
  const { businessId = "" } = useParams<{ businessId: string }>();
  const [store, setStore] = useState<StorefrontBusiness | null>(null);
  const [categories, setCategories] = useState<StorefrontCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [products, setProducts] = useState<StorefrontProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<StorefrontCartItem[]>([]);
  const [search, setSearch] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortMode, setSortMode] = useState<"none" | "asc" | "desc">("none");
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(999);
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [variantProduct, setVariantProduct] = useState<StorefrontProduct | null>(null);
  const [variantOptions, setVariantOptions] = useState<Array<{ id: number; description: string; price: number; promotionPrice: number | null }>>([]);

  const pageLogic = useMemo(() => {
    const repository = new CatalogStorefrontApi(getPosApiBaseUrl());
    const service = new CatalogStorefrontService(repository);
    return new CatalogStorefrontExperiencePage(service);
  }, []);

  useEffect(() => {
    setPage(1);
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

  const addVariantToCart = (variant: { id: number; description: string; price: number; promotionPrice: number | null }) => {
    if (!variantProduct) return;
    const syntheticId = Number(`${variantProduct.id}${variant.id}`);
    const variantPrice = variant.promotionPrice && variant.promotionPrice > 0 ? variant.promotionPrice : variant.price;

    setCart((current) => {
      const existing = current.find((item) => item.productId === syntheticId);
      if (existing) {
        return current.map((item) => (item.productId === syntheticId ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...current, { productId: syntheticId, name: `${variantProduct.name} · ${variant.description}`, price: variantPrice, quantity: 1, image: variantProduct.image }];
    });
    setVariantModalOpen(false);
    setVariantProduct(null);
    setVariantOptions([]);
    setToast("Variante agregada al carrito");
  };

  const productsWithImage = useMemo(
    () => filteredProducts.filter((product) => Boolean(product.image && product.image.trim().length > 0)),
    [filteredProducts],
  );
  const phoneDigits = (store?.phone ?? "").replace(/\D/g, "");
  const whatsappOrderLink = phoneDigits
    ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(formatWhatsappText(store?.name ?? "Catálogo digital", cart, total))}`
    : null;

  const handleSelectCategory = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setPage(1);
  };

  return (
    <main className="catalog-v2">
      <header className="catalog-v2__header">
        <h1>{store?.name || "Catálogo digital"}</h1>
        <Link to="/v2/catalogo/pedido" className="catalog-v2__cart-link" aria-label="Ver carrito">
          🛒
          {totalItems > 0 ? <span>{totalItems}</span> : null}
        </Link>
      </header>

      <section className="catalog-v2__tools" aria-label="Búsqueda de productos">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar producto..."
          aria-label="Buscar producto"
        />
              <button type="button" className="catalog-v2__filter-btn" onClick={() => setShowFilters(true)}>Filtros</button>
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
          <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>
            Anterior
          </button>
          <span>Página {page} de {totalPages}</span>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page === totalPages}
          >
            Siguiente
          </button>
        </nav>
      ) : null}

      <aside className={`catalog-v2__cart ${showCart ? "is-open" : ""}`} aria-label="Carrito">
        <h3>Carrito</h3>
        <p>{totalItems} artículo(s)</p>
        <ul>
          {cart.map((item) => (
            <li key={item.productId}>
              <span>{item.name} × {item.quantity}</span>
              <strong>{money(item.price * item.quantity)}</strong>
            </li>
          ))}
        </ul>
        <div className="catalog-v2__total">Total: <strong>{money(total)}</strong></div>
        <div className="catalog-v2__cart-actions">
          <button type="button" onClick={() => setCart([])} disabled={cart.length === 0}>Vaciar</button>
          {whatsappOrderLink ? (
            <a href={whatsappOrderLink} target="_blank" rel="noreferrer" className={cart.length === 0 ? "is-disabled" : ""}>
              Pedir por WhatsApp
            </a>
          ) : null}
        </div>
      </aside>

      {showFilters ? (
        <div className="catalog-v2-filters__backdrop">
          <aside className="catalog-v2-filters">
            <h3>Filtros</h3>
            <label><input type="radio" checked={sortMode === "asc"} onChange={() => setSortMode("asc")} /> Precio de menor a mayor</label>
            <label><input type="radio" checked={sortMode === "desc"} onChange={() => setSortMode("desc")} /> Precio de mayor a menor</label>
            <label>Min<input type="number" value={priceMin} onChange={(e) => setPriceMin(Number(e.target.value || 0))} /></label>
            <label>Max<input type="number" value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value || 999))} /></label>
            <div className="catalog-v2-filters__actions">
              <button type="button" onClick={() => { setSortMode("none"); setPriceMin(0); setPriceMax(999); }}>Limpiar</button>
              <button type="button" onClick={() => setShowFilters(false)}>Aplicar</button>
            </div>
          </aside>
        </div>
      ) : null}

      <VariantSelectionModalV2
        open={variantModalOpen}
        productName={variantProduct?.name ?? "Variantes"}
        variants={variantOptions}
        onClose={() => setVariantModalOpen(false)}
        onConfirm={addVariantToCart}
      />

      {totalItems > 0 ? (
        <button type="button" className="catalog-v2__cart-fab" onClick={() => setShowCart((current) => !current)}>
          {showCart ? "Ocultar carrito" : `Ver carrito (${totalItems}) · ${money(total)}`}
        </button>
      ) : null}
    </main>
  );
};
