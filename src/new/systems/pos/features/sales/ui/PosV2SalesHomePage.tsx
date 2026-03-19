import { useMemo, useState } from "react";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import "./PosV2SalesHomePage.css";

type SaleItemVm = {
  id: number;
  name: string;
  price: number;
  category: string;
};

type PaymentMethod = "Efectivo" | "Tarjeta" | "Transferencia";
type MobileStep = "catalog" | "cart" | "checkout";
type CompletedSale = {
  folio: string;
  paymentMethod: PaymentMethod;
  table: string;
  total: number;
};

const SAMPLE_PRODUCTS: SaleItemVm[] = [
  { id: 1, name: "Latte", price: 56, category: "Bebidas" },
  { id: 2, name: "Americano", price: 42, category: "Bebidas" },
  { id: 3, name: "Croissant", price: 34, category: "Panadería" },
  { id: 4, name: "Sandwich", price: 89, category: "Comida" },
  { id: 5, name: "Cheesecake", price: 62, category: "Postres" },
  { id: 6, name: "Té Chai", price: 48, category: "Bebidas" },
  { id: 7, name: "Wrap de pollo", price: 96, category: "Comida" },
  { id: 8, name: "Muffin", price: 39, category: "Panadería" },
];

const CATEGORIES = ["Todas", "Bebidas", "Comida", "Panadería", "Postres"];
const TABLE_OPTIONS = ["Mesa 1", "Mesa 2", "Mesa 3", "Mesa 4", "Mesa 5", "Para llevar"];

export const PosV2SalesHomePage = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const [isGrid, setIsGrid] = useState(true);
  const [cart, setCart] = useState<Record<number, { name: string; price: number; quantity: number }>>({});
  const [discountPercent, setDiscountPercent] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Efectivo");
  const [ticket, setTicket] = useState<string | null>(null);
  const [mobileStep, setMobileStep] = useState<MobileStep>("catalog");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState("Mesa 1");
  const [completedSale, setCompletedSale] = useState<CompletedSale | null>(null);

  const filteredProducts = useMemo(() => {
    return SAMPLE_PRODUCTS.filter((product) => {
      const matchCategory = category === "Todas" || product.category === category;
      const matchSearch = product.name.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [category, search]);

  const cartItems = useMemo(() => Object.entries(cart).map(([id, value]) => ({ id: Number(id), ...value })), [cart]);

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const discount = subtotal * (Number(discountPercent) / 100);
    const total = Math.max(0, subtotal - discount);
    const items = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return { subtotal, discount, total, items };
  }, [cartItems, discountPercent]);

  const addToCart = (product: SaleItemVm) => {
    setCart((current) => {
      const existing = current[product.id];
      return {
        ...current,
        [product.id]: {
          name: product.name,
          price: product.price,
          quantity: (existing?.quantity ?? 0) + 1,
        },
      };
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((current) => {
      const target = current[id];
      if (!target) return current;

      const nextQuantity = target.quantity + delta;
      if (nextQuantity <= 0) {
        const { [id]: _, ...rest } = current;
        return rest;
      }

      return {
        ...current,
        [id]: {
          ...target,
          quantity: nextQuantity,
        },
      };
    });
  };

  const discountValue = Number(discountPercent);

  const handleCompleteSale = () => {
    if (!totals.items) {
      setValidationError("Agrega productos antes de finalizar la venta.");
      return;
    }

    if (Number.isNaN(discountValue) || discountValue < 0 || discountValue > 100) {
      setValidationError("El descuento debe estar entre 0 y 100.");
      return;
    }

    setValidationError(null);
    const folio = `RVK-${Date.now().toString().slice(-6)}`;
    setTicket(`Venta ${folio} · ${paymentMethod} · ${selectedTable} · Total $${totals.total.toFixed(2)}`);
    setCompletedSale({
      folio,
      paymentMethod,
      table: selectedTable,
      total: totals.total,
    });
    setCart({});
    setDiscountPercent("0");
    setMobileStep("catalog");
  };

  return (
    <PosV2Shell title="Ventas" subtitle="Flujo funcional v2 (carrito, descuento, cobro y cierre)">
      <section className="pos-v2-sales-home pos-v2-sales-layout">
        <div className="pos-v2-sales-home__mobile-steps" role="tablist" aria-label="Flujo de venta">
          <button type="button" className={mobileStep === "catalog" ? "is-active" : ""} onClick={() => setMobileStep("catalog")}>
            🧾 Catálogo
          </button>
          <button type="button" className={mobileStep === "cart" ? "is-active" : ""} onClick={() => setMobileStep("cart")}>
            🛒 Carrito ({totals.items})
          </button>
          <button type="button" className={mobileStep === "checkout" ? "is-active" : ""} onClick={() => setMobileStep("checkout")}>
            💳 Cobro
          </button>
        </div>

        <section className={`pos-v2-sales-home__catalog ${mobileStep === "catalog" ? "is-mobile-active" : ""}`}>
          <div className="pos-v2-sales-home__toolbar">
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
            {CATEGORIES.map((item) => {
              const active = item === category;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={active ? "is-active" : ""}
                >
                  {item}
                </button>
              );
            })}
          </div>

          <div className={`pos-v2-sales-home__products ${isGrid ? "is-grid" : "is-list"}`}>
            {filteredProducts.map((product) => (
              <article key={product.id} className="pos-v2-sales-home__product-card">
                <p className="pos-v2-sales-home__product-category">{product.category}</p>
                <h3>{product.name}</h3>
                <strong>${product.price.toFixed(2)}</strong>
                <button type="button" onClick={() => addToCart(product)}>
                  Agregar
                </button>
              </article>
            ))}
          </div>
        </section>

        <aside className={`pos-v2-sales-home__cart-panel ${mobileStep === "cart" || mobileStep === "checkout" ? "is-mobile-active" : ""}`}>
          <h2>Carrito · {selectedTable}</h2>

          {cartItems.length === 0 ? <p className="pos-v2-sales-home__empty">No hay productos agregados.</p> : null}

          {cartItems.length > 0 ? (
            <ul className="pos-v2-sales-home__cart-list">
              {cartItems.map((item) => (
                <li key={item.id}>
                  <div>
                    <p>{item.name}</p>
                    <small>${item.price.toFixed(2)}</small>
                  </div>
                  <div className="pos-v2-sales-home__qty-controls">
                    <button type="button" onClick={() => updateQuantity(item.id, -1)}>-</button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.id, 1)}>+</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="pos-v2-sales-home__checkout">
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

            <label>
              Método de pago
              <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Transferencia</option>
              </select>
            </label>

            <label>
              Mesa
              <select value={selectedTable} onChange={(event) => setSelectedTable(event.target.value)}>
                {TABLE_OPTIONS.map((table) => (
                  <option key={table} value={table}>{table}</option>
                ))}
              </select>
            </label>

            <div className="pos-v2-sales-home__totals">
              <p><span>Subtotal</span><strong>${totals.subtotal.toFixed(2)}</strong></p>
              <p><span>Descuento</span><strong>-${totals.discount.toFixed(2)}</strong></p>
              <p className="is-total"><span>Total</span><strong>${totals.total.toFixed(2)}</strong></p>
            </div>

            <button type="button" className="pos-v2-sales-home__complete" onClick={handleCompleteSale} disabled={!totals.items}>
              Finalizar venta
            </button>

            {validationError ? <p className="pos-v2-sales-home__error">{validationError}</p> : null}
            {ticket ? <p className="pos-v2-sales-home__ticket">{ticket}</p> : null}
          </div>
        </aside>
      </section>

      {totals.items > 0 ? (
        <button type="button" className="pos-v2-sales-home__mobile-order-resume" onClick={() => setMobileStep("cart")}>
          <span>{totals.items} prod.</span>
          <strong>${totals.total.toFixed(2)}</strong>
          <em>Ver pedido</em>
        </button>
      ) : null}

      <div className="pos-v2-sales-home__tables-bar" aria-label="Barra de mesas">
        {TABLE_OPTIONS.map((table) => {
          const isActive = table === selectedTable;
          const isOccupied = isActive && totals.items > 0;

          return (
            <button
              key={table}
              type="button"
              className={`${isActive ? "is-active" : ""} ${isOccupied ? "is-occupied" : ""}`.trim()}
              onClick={() => setSelectedTable(table)}
            >
              {table}
            </button>
          );
        })}
      </div>

      {completedSale ? (
        <div className="pos-v2-sales-home__sale-modal" role="dialog" aria-modal="true" aria-label="Venta finalizada">
          <div className="pos-v2-sales-home__sale-modal-card">
            <h3>✅ Venta finalizada</h3>
            <p>Folio: <strong>{completedSale.folio}</strong></p>
            <p>Mesa: <strong>{completedSale.table}</strong></p>
            <p>Método: <strong>{completedSale.paymentMethod}</strong></p>
            <p>Total: <strong>${completedSale.total.toFixed(2)}</strong></p>

            <div className="pos-v2-sales-home__sale-modal-actions">
              <button type="button" onClick={() => window.print()}>Imprimir ticket</button>
              <button type="button" className="is-secondary" onClick={() => setCompletedSale(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      ) : null}
    </PosV2Shell>
  );
};
