import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getPosApiBaseUrl } from "../../../pos/shared/config/posEnv";
import { CatalogStorefrontApi } from "../api/CatalogStorefrontApi";
import { StorefrontBusiness, StorefrontCartItem, StorefrontProduct } from "../model/CatalogStorefrontModels";
import { StorefrontProductGrid } from "./StorefrontProductGrid";
import "./CatalogStorefrontPage.css";

const money = (value: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 }).format(value);

export const CatalogStorefrontPage = () => {
  const { businessId = "" } = useParams<{ businessId: string }>();
  const [store, setStore] = useState<StorefrontBusiness | null>(null);
  const [products, setProducts] = useState<StorefrontProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<StorefrontCartItem[]>([]);
  const [search, setSearch] = useState("");
  const [showCart, setShowCart] = useState(false);

  const api = useMemo(() => new CatalogStorefrontApi(getPosApiBaseUrl()), []);

  useEffect(() => {
    const run = async () => {
      if (!businessId) {
        setError("No encontramos el negocio solicitado.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const [business, items] = await Promise.all([api.getBusinessById(businessId), api.getProductsByBusiness(businessId)]);
        setStore(business);
        setProducts(items);
      } catch {
        setError("No fue posible cargar el catálogo digital.");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [api, businessId]);

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
  };
  const removeFromCart = (product: StorefrontProduct) => {
    setCart((current) => current.filter((item) => item.productId !== product.id));
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
  const filteredProducts = useMemo(
    () =>
      normalizedSearch.length === 0
        ? products
        : products.filter((product) => `${product.name} ${product.description}`.toLowerCase().includes(normalizedSearch)),
    [normalizedSearch, products],
  );

  return (
    <main className="catalog-v2">
      <header className="catalog-v2__header">
        <h1>{store?.name || "Catálogo digital"}</h1>
        <p>{loading ? "Cargando productos..." : `${products.length} producto(s) disponibles`}</p>
      </header>

      <section className="catalog-v2__tools" aria-label="Búsqueda de productos">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar producto..."
          aria-label="Buscar producto"
        />
        {store?.phone ? (
          <a href={`https://wa.me/${store.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
        ) : null}
      </section>

      {error ? <p className="catalog-v2__error">{error}</p> : null}

      <section aria-label="Productos del catálogo">
        <StorefrontProductGrid
          products={filteredProducts}
          onAdd={addToCart}
          onRemove={removeFromCart}
          onDecrement={decrementFromCart}
          existingQuantities={cartQuantityMap}
          formatPrice={money}
          phone={store?.phone ?? null}
        />
        {!loading && filteredProducts.length === 0 ? (
          <p className="catalog-v2__empty">No encontramos productos con ese filtro.</p>
        ) : null}
      </section>

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
      </aside>

      {totalItems > 0 ? (
        <button type="button" className="catalog-v2__cart-fab" onClick={() => setShowCart((current) => !current)}>
          {showCart ? "Ocultar carrito" : `Ver carrito (${totalItems}) · ${money(total)}`}
        </button>
      ) : null}
    </main>
  );
};
