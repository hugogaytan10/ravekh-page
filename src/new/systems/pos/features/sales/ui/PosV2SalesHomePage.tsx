import { useEffect, useMemo, useState } from "react";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import MoreIcon from "../../../../../../assets/POS/MoreIcon";
import { Basket } from "../../../../../../assets/POS/Basket";
import MoneyIcon from "../../../../../../assets/POS/MoneyIcon";
import { Trash } from "../../../../../../assets/POS/Trash";
import { FiCreditCard, FiDollarSign, FiRepeat } from "react-icons/fi";
import { jwtDecode } from "jwt-decode";
import "./PosV2SalesHomePage.css";
import { ModernSystemsFactory } from "../../../../../index";

type SaleItemVm = {
  id: number;
  name: string;
  price: number;
  category: string;
  image?: string;
};

type PaymentMethod = "Efectivo" | "Tarjeta" | "Transferencia";
type MobileStep = "catalog" | "cart" | "checkout";
type CompletedSale = {
  folio: string;
  paymentMethod: PaymentMethod;
  table: string;
  total: number;
  customerName?: string;
};

type CustomerVm = {
  id: number;
  name: string;
};

const PAYMENT_METHOD_OPTIONS: Array<{
  value: PaymentMethod;
  label: string;
  Icon: typeof FiDollarSign;
}> = [
    { value: "Efectivo", label: "Efectivo", Icon: FiDollarSign },
    { value: "Tarjeta", label: "Tarjeta", Icon: FiCreditCard },
    { value: "Transferencia", label: "Transferencia", Icon: FiRepeat },
  ];

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://apipos.ravekh.com/api/";
const TOKEN_KEY = "pos-v2-token";
const BUSINESS_ID_KEY = "pos-v2-business-id";
const EMPLOYEE_ID_KEY = "pos-v2-employee-id";
const DEFAULT_TABLE_OPTIONS = ["Para llevar"];
const DEBUG_KEY = "pos-v2-debug";

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

export const PosV2SalesHomePage = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const [isGrid, setIsGrid] = useState(true);
  const [products, setProducts] = useState<SaleItemVm[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [cart, setCart] = useState<Record<number, { name: string; price: number; quantity: number }>>({});
  const [discountPercent, setDiscountPercent] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Efectivo");
  const [ticket, setTicket] = useState<string | null>(null);
  const [mobileStep, setMobileStep] = useState<MobileStep>("catalog");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isCompletingSale, setIsCompletingSale] = useState(false);
  const [tables, setTables] = useState<string[]>(DEFAULT_TABLE_OPTIONS);
  const [selectedTable, setSelectedTable] = useState("Para llevar");
  const [completedSale, setCompletedSale] = useState<CompletedSale | null>(null);
  const [isMobileTablesOpen, setIsMobileTablesOpen] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [tablesError, setTablesError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<CustomerVm[]>([]);
  const [customersError, setCustomersError] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  const debugLog = (...args: unknown[]) => {
    if (window.localStorage.getItem(DEBUG_KEY) === "true") {
      console.log("[POS-V2-SALES]", ...args);
    }
  };

  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_KEY);
    const businessId = Number(window.localStorage.getItem(BUSINESS_ID_KEY));

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
      .getSellableProducts(businessId, token)
      .then((items) => {
        const mapped: SaleItemVm[] = items.map((item: {
          id: number;
          name: string;
          price: number;
          categoryName?: string | null;
          image?: string | null;
          images?: string[];
        }) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          category: item.categoryName?.trim() || "General",
          image: toAbsoluteImageUrl(item.image || item.images?.find(Boolean)),
        }));
        setProducts(mapped);
      })
      .catch((error) => {
        setProductsError(error instanceof Error ? error.message : "No pudimos cargar tus productos.");
      })
      .finally(() => setLoadingProducts(false));
  }, []);

  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_KEY);
    const businessId = Number(window.localStorage.getItem(BUSINESS_ID_KEY));

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
    const token = window.localStorage.getItem(TOKEN_KEY);
    const businessId = Number(window.localStorage.getItem(BUSINESS_ID_KEY));

    if (!token || !businessId) {
      setTables(DEFAULT_TABLE_OPTIONS);
      setTablesError("No encontramos sesión para cargar mesas.");
      return;
    }

    const factory = new ModernSystemsFactory(API_BASE_URL);
    const tableZonePage = factory.createPosTableZonePage();
    setLoadingTables(true);

    tableZonePage
      .getTableZoneCards(businessId, token)
      .then((zones) => {
        const activeZones = zones
          .filter((zone) => zone.isActive)
          .sort((a, b) => a.id - b.id)
          .map((zone) => zone.name.trim())
          .filter(Boolean);
        const normalizedTables = Array.from(new Set([...activeZones, "Para llevar"]));
        debugLog("Mesas cargadas desde capa moderna:", normalizedTables);
        setTables(normalizedTables.length ? normalizedTables : DEFAULT_TABLE_OPTIONS);
        setTablesError(null);
      })
      .catch((error) => {
        console.error("[POS-V2-SALES] Error al cargar mesas", error);
        setTables(DEFAULT_TABLE_OPTIONS);
        setTablesError(error instanceof Error ? error.message : "No se pudieron cargar las mesas.");
      })
      .finally(() => setLoadingTables(false));
  }, []);

  useEffect(() => {
    if (!tables.includes(selectedTable)) {
      setSelectedTable("Para llevar");
    }
  }, [tables, selectedTable]);

  const categories = useMemo(() => {
    const dynamic = Array.from(new Set(products.map((item) => item.category).filter(Boolean)));
    return ["Todas", ...dynamic];
  }, [products]);

  useEffect(() => {
    if (!categories.includes(category)) {
      setCategory("Todas");
    }
  }, [categories, category]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchCategory = category === "Todas" || product.category === category;
      const matchSearch = product.name.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [category, products, search]);

  const cartItems = useMemo(() => Object.entries(cart).map(([id, value]) => ({ id: Number(id), ...value })), [cart]);

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const discount = subtotal * (Number(discountPercent) / 100);
    const total = Math.max(0, subtotal - discount);
    const items = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return { subtotal, discount, total, items };
  }, [cartItems, discountPercent]);

  const mobileSteps = useMemo(
    () => [
      {
        key: "catalog" as const,
        label: "Catálogo",
        Icon: ({ active }: { active: boolean }) => (
          <MoreIcon width={16} height={16} strokeColor={active ? "#ffffff" : "#6D01D1"} strokeWidth={2.2} />
        ),
      },
      {
        key: "cart" as const,
        label: "Cantidad",
        helper: totals.items ? `${totals.items} prod.` : undefined,
        Icon: ({ active }: { active: boolean }) => (
          <Basket width={18} height={18} fill={active ? "#ffffff" : "#6D01D1"} />
        ),
      },
      {
        key: "checkout" as const,
        label: "Cobro",
        Icon: ({ active }: { active: boolean }) => (
          <MoneyIcon width={16} height={16} color={active ? "#ffffff" : "#6D01D1"} />
        ),
      },
    ],
    [totals.items],
  );

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

  const setQuantity = (id: number, quantity: number) => {
    const safeQuantity = Number.isNaN(quantity) ? 0 : Math.max(0, Math.floor(quantity));

    setCart((current) => {
      const target = current[id];
      if (!target) return current;
      if (safeQuantity <= 0) {
        const { [id]: _, ...rest } = current;
        return rest;
      }

      return {
        ...current,
        [id]: {
          ...target,
          quantity: safeQuantity,
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

    const token = window.localStorage.getItem(TOKEN_KEY);
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
      Product_Id: item.id,
      Quantity: item.quantity,
      Price: item.price,
      Cost: 0,
    }));

    const payloadByTable = {
      Employee_Id: employeeId,
      Customer_Id: selectedCustomerId ? Number(selectedCustomerId) : undefined,
      PaymentMethod: paymentMethod,
      Total: totals.total,
      Discount: discountValue,
      Tax: false,
    };

    setIsCompletingSale(true);
    setValidationError(null);
    debugLog("Intentando finalizar venta.", {
      endpoint: selectedTable === "Para llevar" ? "orders" : "commands",
      selectedTable,
      employeeId,
      items: lineItems,
      total: totals.total,
      paymentMethod,
    });

    try {
      const endpoint = selectedTable === "Para llevar" ? "orders" : "commands";
      const payload = selectedTable === "Para llevar"
        ? {
          Order: payloadByTable,
          OrderDetails: lineItems,
        }
        : {
          Command: {
            ...payloadByTable,
            Table_Id: selectedTable,
          },
          Commands_has_Products: lineItems,
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
      setTicket(`Venta ${folio} · ${paymentMethod} · ${selectedTable} · Total $${totals.total.toFixed(2)}`);
      setCompletedSale({
        folio,
        paymentMethod,
        table: selectedTable,
        total: totals.total,
        customerName: customers.find((customer) => String(customer.id) === selectedCustomerId)?.name,
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

  return (
    <PosV2Shell title="Entorno de prueba de Ravekh POS v2">
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
            {categories.map((item) => {
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

          {loadingProducts ? <p className="pos-v2-sales-home__empty">Cargando productos…</p> : null}
          {productsError ? <p className="pos-v2-sales-home__error">{productsError}</p> : null}

          <div className={`pos-v2-sales-home__products ${isGrid ? "is-grid" : "is-list"}`}>
            {filteredProducts.map((product) => (
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
                </div>
                <div className="pos-v2-sales-home__product-side">
                  <strong>${product.price.toFixed(2)}</strong>
                  <button type="button" onClick={() => addToCart(product)}>
                    Agregar
                  </button>
                </div>
              </article>
            ))}

            {!loadingProducts && !productsError && filteredProducts.length === 0 ? (
              <p className="pos-v2-sales-home__empty">No encontramos productos para esta categoría.</p>
            ) : null}
          </div>
        </section>

        <aside className={`pos-v2-sales-home__cart-panel ${mobileStep === "cart" || mobileStep === "checkout" ? "is-mobile-active" : ""}`}>
          <h2>Mesa · {selectedTable}</h2>

          <div className={`pos-v2-sales-home__cart-content ${mobileStep === "cart" ? "is-mobile-active" : ""}`}>
            <div className="pos-v2-sales-home__cart-mobile-actions">
              <button type="button" className="pos-v2-sales-home__back" onClick={() => setMobileStep("catalog")}>
                Regresar al catálogo
              </button>
            </div>
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
                      <button type="button" className="is-danger" onClick={() => setQuantity(item.id, 0)} aria-label={`Eliminar ${item.name} del carrito`}>
                        <Trash width={14} height={14} fill="#b91c1c" />
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(event) => setQuantity(item.id, Number(event.target.value))}
                        aria-label={`Cantidad de ${item.name}`}
                      />
                      <button type="button" onClick={() => updateQuantity(item.id, 1)}>+1</button>
                      <button type="button" onClick={() => updateQuantity(item.id, 10)}>+10</button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="pos-v2-sales-home__totals">
              <p><span>Subtotal</span><strong>${totals.subtotal.toFixed(2)}</strong></p>
              <p><span>Descuento</span><strong>-${totals.discount.toFixed(2)}</strong></p>
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
              Método de pago
              <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Transferencia</option>
              </select>
            </label>

            <label>
              Mesa
              <select value={selectedTable} onChange={(event) => setSelectedTable(event.target.value)} disabled={loadingTables}>
                <option value="" disabled>Selecciona mesa</option>

                {
                  tables.length > 0 &&
                  tables.map((table) => (
                    <option key={table} value={table}>{table}</option>
                  ))}
              </select>
            </label>

            <label>
              Cliente (opcional)
              <select value={selectedCustomerId} onChange={(event) => setSelectedCustomerId(event.target.value)}>
                <option value="">Venta general</option>
                {
                  customers.length > 0 &&
                  customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
              </select>
            </label>
            {!customersError && customers.length > 0 ? <small className="pos-v2-sales-home__customer-hint">Puedes vincular la venta a cliente para historial y recompensas.</small> : null}

            <div className="pos-v2-sales-home__totals">
              <p><span>Subtotal</span><strong>${totals.subtotal.toFixed(2)}</strong></p>
              <p><span>Descuento</span><strong>-${totals.discount.toFixed(2)}</strong></p>
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

            {validationError ? <p className="pos-v2-sales-home__error">{validationError}</p> : null}
            {ticket ? <p className="pos-v2-sales-home__ticket">{ticket}</p> : null}
          </div>
        </aside>
      </section>

      {totals.items > 0 ? (
        <button type="button" className="pos-v2-sales-home__mobile-order-resume" onClick={() => setMobileStep("cart")}>
          <span>{totals.items} prod.</span>
          <strong>${totals.total.toFixed(2)}</strong>
          <em>Ver mesa</em>
        </button>
      ) : null}

      <div className="pos-v2-sales-home__tables-bar" aria-label="Barra de mesas">
        {loadingTables ? (
          <div className="pos-v2-sales-home__tables-skeleton" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, index) => <span key={`tables-skeleton-${index}`} />)}
          </div>
        ) : tables.map((table) => {
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

      <div className="pos-v2-sales-home__mobile-legacy-dock">
        <button type="button" onClick={() => setIsMobileTablesOpen(true)}>Mesas</button>
        <button type="button" className="is-summary" onClick={() => setMobileStep("cart")}>
          {totals.items.toFixed(2)}x Items = ${totals.total.toFixed(2)}
        </button>
      </div>

      {isMobileTablesOpen ? (
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
              ) : tables.map((table) => {
                const isActive = table === selectedTable;
                return (
                  <button
                    key={table}
                    type="button"
                    className={isActive ? "is-active" : ""}
                    onClick={() => {
                      setSelectedTable(table);
                      setIsMobileTablesOpen(false);
                      setMobileStep("catalog");
                    }}
                  >
                    {table}
                  </button>
                );
              })}
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
            <p>Método: <strong>{completedSale.paymentMethod}</strong></p>
            <p>Cliente: <strong>{completedSale.customerName ?? "General"}</strong></p>
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
