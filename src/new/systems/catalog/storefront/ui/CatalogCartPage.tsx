import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StorefrontCartItem } from "../model/CatalogStorefrontModels";
import "./CatalogCartPage.css";

const money = (value: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 }).format(value);

const getBusinessId = () => window.localStorage.getItem("idBusiness") ?? "";

const getCartKey = (businessId: string) => `catalog-v2-cart:${businessId}`;

const loadCart = (businessId: string): StorefrontCartItem[] => {
  if (!businessId) return [];
  const raw = window.localStorage.getItem(getCartKey(businessId));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as StorefrontCartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const CatalogCartPage = () => {
  const navigate = useNavigate();
  const businessId = getBusinessId();
  const [cart, setCart] = useState<StorefrontCartItem[]>(() => loadCart(businessId));
  const storeName = window.localStorage.getItem("catalog-v2-store-name") || "Catálogo";

  const persist = (next: StorefrontCartItem[]) => {
    if (!businessId) return;
    setCart(next);
    window.localStorage.setItem(getCartKey(businessId), JSON.stringify(next));
  };

  const increment = (productId: number) => {
    persist(cart.map((item) => (item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item)));
  };

  const decrement = (productId: number) => {
    persist(
      cart
        .map((item) => (item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0),
    );
  };

  const remove = (productId: number) => {
    persist(cart.filter((item) => item.productId !== productId));
  };

  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  return (
    <main className="catalog-v2-cart-page">
      <header className="catalog-v2-cart-page__header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Volver">←</button>
        <h1>{storeName}</h1>
      </header>

      <section className="catalog-v2-cart-page__content">
        <h2>Finaliza el pedido</h2>
        <div className="catalog-v2-cart-page__grid">
          <article>
            <h3>Tu carrito</h3>
            <ul>
              {cart.map((item) => (
                <li key={item.productId}>
                  {item.image ? <img src={item.image} alt={item.name} /> : <div className="placeholder" />}
                  <div>
                    <p>{item.name}</p>
                    <strong>{money(item.price * item.quantity)}</strong>
                    <small>Unitario: {money(item.price)}</small>
                  </div>
                  <div className="qty-controls">
                    <button type="button" onClick={() => decrement(item.productId)}>−</button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => increment(item.productId)}>+</button>
                  </div>
                  <button type="button" onClick={() => remove(item.productId)}>🗑</button>
                </li>
              ))}
            </ul>
          </article>

          <aside>
            <div className="summary">
              <p><span>Total de artículos</span><strong>{totalItems}</strong></p>
              <p><span>Total</span><strong>{money(total)}</strong></p>
            </div>
            <Link to="/v2/catalogo/pedido-info" className="primary">Pagar</Link>
            <button type="button" className="secondary" onClick={() => navigate(`/v2/catalogo/${businessId}`)}>Seguir comprando</button>
            <button type="button" className="ghost" onClick={() => persist([])}>Limpiar carrito</button>
          </aside>
        </div>
      </section>
    </main>
  );
};
