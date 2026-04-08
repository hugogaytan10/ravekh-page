import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { StorefrontCartItem } from "../model/CatalogStorefrontModels";
import "./CatalogCartPage.css";
import { useCatalogThemeSync } from "./useCatalogThemeSync";

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
  useCatalogThemeSync();
  const navigate = useNavigate();
  const businessId = getBusinessId();
  const [cart, setCart] = useState<StorefrontCartItem[]>(() => loadCart(businessId));
  const [showClearModal, setShowClearModal] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [quantityWarnings, setQuantityWarnings] = useState<Record<number, string | null>>({});
  const storeName = window.localStorage.getItem("catalog-v2-store-name") || "Catálogo";

  const persist = (next: StorefrontCartItem[]) => {
    if (!businessId) return;
    setCart(next);
    window.localStorage.setItem(getCartKey(businessId), JSON.stringify(next));
  };

  const increment = (productId: number) => {
    persist(cart.map((item) => (item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item)));
    setQuantityWarnings((prev) => ({ ...prev, [productId]: null }));
  };

  const decrement = (productId: number) => {
    const product = cart.find((item) => item.productId === productId);
    if (!product) return;

    if (product.quantity <= 1) {
      setDeletingProductId(productId);
      return;
    }

    persist(
      cart.map((item) => (item.productId === productId ? { ...item, quantity: Math.max(item.quantity - 1, 1) } : item)),
    );
    setQuantityWarnings((prev) => ({ ...prev, [productId]: null }));
  };

  const remove = (productId: number) => {
    persist(cart.filter((item) => item.productId !== productId));
    setDeletingProductId(null);
  };

  const handleManualQuantityChange = (productId: number, value: string) => {
    let parsed = Math.floor(Number(value));
    if (Number.isNaN(parsed)) parsed = 1;
    parsed = Math.max(1, parsed);

    if (parsed > 999) {
      parsed = 999;
      setQuantityWarnings((prev) => ({ ...prev, [productId]: "Cantidad máxima: 999." }));
    } else {
      setQuantityWarnings((prev) => ({ ...prev, [productId]: null }));
    }

    persist(cart.map((item) => (item.productId === productId ? { ...item, quantity: parsed } : item)));
  };

  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  return (
    <main className="catalog-v2-cart-page">
      <header className="catalog-v2-cart-page__header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Volver"><FiArrowLeft /></button>
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
                    <strong>{money(item.price)}</strong>
                    <small>Total: {money(item.price * item.quantity)}</small>
                    <div className="qty-controls">
                      <button type="button" onClick={() => decrement(item.productId)}><FiMinus /></button>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(event) => handleManualQuantityChange(item.productId, event.target.value)}
                        aria-label={`Cantidad de ${item.name}`}
                      />
                      <button type="button" onClick={() => increment(item.productId)}><FiPlus /></button>
                    </div>
                    {quantityWarnings[item.productId] ? <small className="warning">{quantityWarnings[item.productId]}</small> : null}
                  </div>
                  <button type="button" className="remove-btn" onClick={() => setDeletingProductId(item.productId)}><FiTrash2 /></button>
                </li>
              ))}
            </ul>
          </article>

          <aside>
            <div className="summary">
              <p><span>Total de artículos</span><strong>{totalItems}</strong></p>
              <p><span>Total</span><strong>{money(total)}</strong></p>
            </div>
            <button type="button" className="primary" onClick={() => navigate("/v2/catalogo/pedido-info")} disabled={cart.length === 0}>Pagar</button>
            <button type="button" className="secondary" onClick={() => navigate(`/v2/catalogo/${businessId}`)}>Seguir comprando</button>
            {cart.length > 0 ? <button type="button" className="ghost" onClick={() => setShowClearModal(true)}>Limpiar carrito</button> : null}
          </aside>
        </div>
      </section>

      {showClearModal ? (
        <div className="cart-modal-overlay">
          <div className="cart-modal">
            <h3>¿Estás seguro?</h3>
            <p>¿Quieres eliminar todos los productos del carrito?</p>
            <div className="cart-modal__actions">
              <button type="button" className="secondary" onClick={() => setShowClearModal(false)}>Cancelar</button>
              <button type="button" className="danger" onClick={() => { persist([]); setShowClearModal(false); }}>Eliminar</button>
            </div>
          </div>
        </div>
      ) : null}

      {deletingProductId != null ? (
        <div className="cart-modal-overlay">
          <div className="cart-modal">
            <h3>¿Estás seguro?</h3>
            <p>¿Quieres eliminar el producto del carrito?</p>
            <div className="cart-modal__actions">
              <button type="button" className="secondary" onClick={() => setDeletingProductId(null)}>Cancelar</button>
              <button type="button" className="danger" onClick={() => remove(deletingProductId)}>Eliminar</button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
};
