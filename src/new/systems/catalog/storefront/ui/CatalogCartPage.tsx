import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { StorefrontCartItem } from "../model/CatalogStorefrontModels";
import { CatalogSocialFooter } from "./CatalogSocialFooter";
import "./CatalogCartPage.css";
import {
  CATALOG_QUOTABLE_LABEL,
  formatCatalogPrice,
  formatCatalogTotal,
  getApplicableWholesaleTier,
  getEffectiveCatalogPriceForQuantity,
  getNextWholesaleTier,
  normalizeWholesalePriceTiers,
} from "./catalogPrice";
import { useCatalogThemeSync } from "./useCatalogThemeSync";

const money = (value: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 }).format(value);

const getBusinessId = () => window.localStorage.getItem("idBusiness") ?? "";
const getCartKey = (businessId: string) => `catalog-v2-cart:${businessId}`;
const getItemKey = (item: StorefrontCartItem) => item.cartKey ?? `${item.productId}-${item.variantId ?? "base"}-${item.colorId ?? "nc"}-${item.sizeId ?? "ns"}`;

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
  const [deletingItemKey, setDeletingItemKey] = useState<string | null>(null);
  const [quantityWarnings, setQuantityWarnings] = useState<Record<string, string | null>>({});
  const storeName = window.localStorage.getItem("catalog-v2-store-name") || "Catálogo";

  const persist = (next: StorefrontCartItem[]) => {
    if (!businessId) return;
    setCart(next);
    window.localStorage.setItem(getCartKey(businessId), JSON.stringify(next));
  };

  const increment = (itemKey: string) => {
    persist(cart.map((item) => (getItemKey(item) === itemKey ? { ...item, quantity: item.quantity + 1 } : item)));
    setQuantityWarnings((prev) => ({ ...prev, [itemKey]: null }));
  };

  const decrement = (itemKey: string) => {
    const product = cart.find((item) => getItemKey(item) === itemKey);
    if (!product) return;
    if (product.quantity <= 1) {
      setDeletingItemKey(itemKey);
      return;
    }
    persist(cart.map((item) => (getItemKey(item) === itemKey ? { ...item, quantity: Math.max(item.quantity - 1, 1) } : item)));
    setQuantityWarnings((prev) => ({ ...prev, [itemKey]: null }));
  };

  const remove = (itemKey: string) => {
    persist(cart.filter((item) => getItemKey(item) !== itemKey));
    setDeletingItemKey(null);
  };

  const handleManualQuantityChange = (itemKey: string, value: string) => {
    let parsed = Math.floor(Number(value));
    if (Number.isNaN(parsed)) parsed = 1;
    parsed = Math.max(1, parsed);
    if (parsed > 999) {
      parsed = 999;
      setQuantityWarnings((prev) => ({ ...prev, [itemKey]: "Cantidad máxima: 999." }));
    } else {
      setQuantityWarnings((prev) => ({ ...prev, [itemKey]: null }));
    }
    persist(cart.map((item) => (getItemKey(item) === itemKey ? { ...item, quantity: parsed } : item)));
  };

  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const totalLabel = useMemo(() => formatCatalogTotal(cart, money), [cart]);

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
              {cart.map((item) => {
                const itemKey = getItemKey(item);
                const tiers = normalizeWholesalePriceTiers(item.wholesalePrices, item.wholesalePrice, item.wholesaleMinQuantity);
                const appliedTier = getApplicableWholesaleTier(tiers, item.quantity);
                const nextTier = getNextWholesaleTier(tiers, item.quantity);
                const unitPrice = getEffectiveCatalogPriceForQuantity(item.price, item.promotionPrice, tiers, item.quantity);

                return (
                  <li key={itemKey}>
                    {item.image ? <img src={item.image} alt={item.name} /> : <div className="placeholder" />}
                    <div>
                      <p>{item.name}</p>
                      <strong>{formatCatalogPrice(unitPrice, money)}</strong>
                      {appliedTier ? <small>Mayoreo aplicado desde {appliedTier.minQuantity} pzas.</small> : tiers.length > 0 ? <small>Mayoreo desde {tiers[0].minQuantity} pzas.</small> : null}
                      {nextTier ? <small>Agrega {nextTier.minQuantity - item.quantity} más para {formatCatalogPrice(nextTier.price, money)} c/u.</small> : null}
                      <small>Total: {unitPrice ? money(unitPrice * item.quantity) : CATALOG_QUOTABLE_LABEL}</small>
                      <div className="qty-controls">
                        <button type="button" onClick={() => decrement(itemKey)}><FiMinus /></button>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(event) => handleManualQuantityChange(itemKey, event.target.value)}
                          aria-label={`Cantidad de ${item.name}`}
                        />
                        <button type="button" onClick={() => increment(itemKey)}><FiPlus /></button>
                      </div>
                      {quantityWarnings[itemKey] ? <small className="warning">{quantityWarnings[itemKey]}</small> : null}
                    </div>
                    <button type="button" className="remove-btn" onClick={() => setDeletingItemKey(itemKey)}><FiTrash2 /></button>
                  </li>
                );
              })}
            </ul>
          </article>

          <aside>
            <div className="summary">
              <p><span>Total de artículos</span><strong>{totalItems}</strong></p>
              <p><span>Total</span><strong>{totalLabel}</strong></p>
            </div>
            <button type="button" className="primary" onClick={() => navigate("/catalogo/pedido-info")} disabled={cart.length === 0}>Pagar</button>
            <button type="button" className="secondary" onClick={() => navigate(`/v2/catalogo/${businessId}`)}>Seguir comprando</button>
            {cart.length > 0 ? <button type="button" className="ghost" onClick={() => setShowClearModal(true)}>Limpiar carrito</button> : null}
          </aside>
        </div>
      </section>

      <CatalogSocialFooter businessId={businessId} />

      {showClearModal ? (
        <div className="cart-modal-overlay"><div className="cart-modal"><h3>¿Estás seguro?</h3><p>¿Quieres eliminar todos los productos del carrito?</p><div className="cart-modal__actions"><button type="button" className="secondary" onClick={() => setShowClearModal(false)}>Cancelar</button><button type="button" className="danger" onClick={() => { persist([]); setShowClearModal(false); }}>Eliminar</button></div></div></div>
      ) : null}

      {deletingItemKey != null ? (
        <div className="cart-modal-overlay"><div className="cart-modal"><h3>¿Estás seguro?</h3><p>¿Quieres eliminar el producto del carrito?</p><div className="cart-modal__actions"><button type="button" className="secondary" onClick={() => setDeletingItemKey(null)}>Cancelar</button><button type="button" className="danger" onClick={() => remove(deletingItemKey)}>Eliminar</button></div></div></div>
      ) : null}
    </main>
  );
};
