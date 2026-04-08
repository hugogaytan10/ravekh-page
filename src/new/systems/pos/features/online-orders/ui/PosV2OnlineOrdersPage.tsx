import { useEffect, useMemo, useState } from "react";
import { ModernSystemsFactory } from "../../../../../index";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import { readPosSessionSnapshot } from "../../../shared/config/posSession";
import type { OnlineOrderCardViewModel, OnlineOrderStatus, OnlineOrderStatusFilter } from "../pages/OnlineOrderTrackingPage";
import "./PosV2OnlineOrdersPage.css";

const API_BASE_URL = getPosApiBaseUrl();
const STATUS_COPY: Record<string, string> = {
  PEDIDO: "Pendiente",
  PENDING: "Pendiente",
  ENTREGADO: "Entregado",
  COMPLETED: "Entregado",
  CANCELADO: "Cancelado",
  CANCELLED: "Cancelado",
};

export const PosV2OnlineOrdersPage = () => {
  const [{ token, businessId }] = useState(() => readPosSessionSnapshot());
  const [filter, setFilter] = useState<OnlineOrderStatusFilter>("pending");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OnlineOrderCardViewModel | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [printingOrder, setPrintingOrder] = useState<OnlineOrderCardViewModel | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<OnlineOrderCardViewModel[]>([]);
  const [businessBranding, setBusinessBranding] = useState<{ name: string; logo: string }>({
    name: "Ravekh POS",
    logo: "",
  });

  const { page, brandingPage } = useMemo(() => {
    const factory = new ModernSystemsFactory(API_BASE_URL);
    return {
      page: factory.createPosOnlineOrderPage(),
      brandingPage: factory.createPosBrandingPage(),
    };
  }, []);

  const loadOrders = async () => {
    if (!token || !Number.isFinite(businessId) || businessId <= 0) {
      setError("No hay sesión activa para cargar pedidos en línea.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const rows = await page.loadOrders(businessId, filter, token);
      setOrders(rows);
      if (rows.length === 0 && !search.trim()) {
        setToast({ type: "info", message: "Aún no tienes pedidos en línea." });
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible cargar pedidos en línea.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [filter]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    const clearPrinting = () => setPrintingOrder(null);
    window.addEventListener("afterprint", clearPrinting);
    return () => window.removeEventListener("afterprint", clearPrinting);
  }, []);

  useEffect(() => {
    const loadBranding = async () => {
      if (!token || !Number.isFinite(businessId) || businessId <= 0) return;
      try {
        const profile = await brandingPage.loadProfile(businessId, token);
        setBusinessBranding({
          name: profile.name || "Ravekh POS",
          logo: profile.logo || "",
        });
      } catch {
        setBusinessBranding({ name: "Ravekh POS", logo: "" });
      }
    };

    loadBranding();
  }, [brandingPage, businessId, token]);

  const filteredOrders = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return orders;
    return orders.filter((order) => `${order.id} ${order.customerName} ${order.status}`.toLowerCase().includes(normalized));
  }, [orders, search]);

  const stats = useMemo(() => {
    const pending = orders.filter((order) => order.status.toUpperCase() === "PEDIDO").length;
    const completed = orders.filter((order) => order.status.toUpperCase() === "ENTREGADO").length;
    const cancelled = orders.filter((order) => ["CANCELADO", "CANCELLED"].includes(order.status.toUpperCase())).length;
    const totalAmount = orders.reduce((acc, order) => acc + (Number(order.total) || 0), 0);
    return { total: orders.length, pending, completed, cancelled, totalAmount };
  }, [orders]);

  const openOrderDetails = async (orderId: number) => {
    setDetailLoading(true);
    setSelectedOrder(null);
    try {
      const selectedFromList = orders.find((order) => order.id === orderId) ?? null;
      const detail = await page.loadOrderDetails(orderId, token);
      setSelectedOrder({
        ...(selectedFromList ?? detail),
        ...detail,
        customerName: selectedFromList?.customerName ?? detail.customerName,
        status: selectedFromList?.status ?? detail.status,
        address: selectedFromList?.address ?? detail.address,
        paymentMethod: selectedFromList?.paymentMethod ?? detail.paymentMethod,
        phoneNumber: selectedFromList?.phoneNumber ?? detail.phoneNumber,
        total: detail.total > 0 ? detail.total : (selectedFromList?.total ?? detail.total),
      });
    } catch (cause) {
      setToast({ type: "error", message: cause instanceof Error ? cause.message : "No se pudo cargar el pedido." });
    } finally {
      setDetailLoading(false);
    }
  };

  const updateStatus = async (orderId: number, status: OnlineOrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const updated = await page.changeOrderStatus(orderId, status, token);
      setOrders((current) => current.map((order) => (order.id === updated.id ? updated : order)));
      if (selectedOrder?.id === updated.id) setSelectedOrder(null);
      await loadOrders();
      setToast({ type: "success", message: `Pedido #${orderId} actualizado a ${status}.` });
    } catch (cause) {
      setToast({ type: "error", message: cause instanceof Error ? cause.message : "No se pudo actualizar el estado." });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);
  const getStatusLabel = (status: string) => STATUS_COPY[status.toUpperCase()] ?? status;

  const summarizeItems = (items: OnlineOrderCardViewModel["items"] | null | undefined) => {
    if (!Array.isArray(items) || items.length === 0) return [];
    const grouped = new Map<string, { name: string; quantity: number; price: number; image: string; itemType: string }>();

    for (const item of items) {
      const key = `${item.name}-${item.price}-${item.itemType ?? ""}`;
      const current = grouped.get(key);
      if (current) {
        current.quantity += item.quantity;
      } else {
        grouped.set(key, {
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          itemType: item.itemType ?? "",
        });
      }
    }

    return Array.from(grouped.values());
  };

  const hasPrintableOrderData = (order: OnlineOrderCardViewModel): boolean => {
    const hasValidId = Number.isFinite(order.id) && order.id > 0;
    const hasItems = summarizeItems(order.items).length > 0;
    const hasTotal = Number.isFinite(order.total) && order.total > 0;
    return hasValidId && hasItems && hasTotal;
  };

  const saveOrderPdf = (order: OnlineOrderCardViewModel) => {
    if (!hasPrintableOrderData(order)) {
      setToast({
        type: "error",
        message: "Este pedido no tiene datos suficientes para imprimir (ID, total e items).",
      });
      return;
    }

    setPrintingOrder(order);
    window.setTimeout(() => {
      window.print();
    }, 180);
  };

  return (
    <PosV2Shell title="Tienda en línea" subtitle="Gestión completa de pedidos del canal online">
      <section className="pos-v2-online-orders">
        <header>
          <div>
            <h2>Pedidos online</h2>
            <p>Revisa, filtra y actualiza el estado de pedidos sin salir del POS v2.</p>
          </div>
          <button type="button" onClick={loadOrders} disabled={loading}>
            {loading ? "Actualizando..." : "Actualizar"}
          </button>
        </header>

        <section className="pos-v2-online-orders__stats" aria-label="Resumen de pedidos online">
          <article><span>Total</span><strong>{stats.total}</strong></article>
          <article><span>Pendientes</span><strong>{stats.pending}</strong></article>
          <article><span>Completados</span><strong>{stats.completed}</strong></article>
          <article><span>Cancelados</span><strong>{stats.cancelled}</strong></article>
          <article><span>Monto total</span><strong>{formatCurrency(stats.totalAmount)}</strong></article>
        </section>

        <section className="pos-v2-online-orders__controls" aria-label="Filtros">
          <div className="pos-v2-online-orders__chips">
            <button type="button" className={filter === "pending" ? "is-active" : ""} onClick={() => setFilter("pending")}>Pendientes</button>
            <button type="button" className={filter === "all" ? "is-active" : ""} onClick={() => setFilter("all")}>Todos</button>
          </div>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por cliente, ID o estado"
            aria-label="Buscar pedidos online"
          />
        </section>

        {error ? <p className="pos-v2-online-orders__error">{error}</p> : null}
        {toast ? <p className={`pos-v2-online-orders__toast is-${toast.type}`}>{toast.message}</p> : null}
        {loading ? (
          <div className="pos-v2-online-orders__skeletons" aria-hidden="true">
            {Array.from({ length: 3 }).map((_, index) => <span key={`skeleton-order-${index}`} />)}
          </div>
        ) : null}

        {!loading ? (
          <ul>
            {filteredOrders.map((order) => (
              <li key={order.id}>
                <div className="pos-v2-online-orders__item-head">
                  <strong>Pedido #{order.id}</strong>
                  <span className={`status status-${order.status.toLowerCase()}`}>{getStatusLabel(order.status)}</span>
                </div>
                <span>{order.customerName}</span>
                <small>Total del pedido: {formatCurrency(order.total)}</small>
                <div className="pos-v2-online-orders__actions">
                  <button type="button" className="is-light" onClick={() => openOrderDetails(order.id)}>
                    Ver detalle
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatus(order.id, "ENTREGADO")}
                    disabled={updatingOrderId === order.id}
                  >
                    Aceptar
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatus(order.id, "CANCELADO")}
                    disabled={updatingOrderId === order.id}
                  >
                    Rechazar
                  </button>
                </div>
              </li>
            ))}
            {filteredOrders.length === 0 ? <li className="is-empty">Aún no tienes pedidos en línea.</li> : null}
          </ul>
        ) : null}

        {(selectedOrder || detailLoading) ? (
          <section className="pos-v2-online-orders__modal" role="dialog" aria-modal="true" aria-label="Detalle de pedido online" onClick={() => setSelectedOrder(null)}>
            <article className="is-sheet" onClick={(event) => event.stopPropagation()}>
              {detailLoading ? <p>Cargando detalle...</p> : null}
              {selectedOrder ? (
                <>
                  <header>
                    <h3>Pedido #{selectedOrder.id}</h3>
                    <button type="button" className="is-light" onClick={() => setSelectedOrder(null)} aria-label="Regresar al listado">← Regresar</button>
                  </header>
                  <p><strong>Cliente:</strong> {selectedOrder.customerName}</p>
                  <p><strong>Estado:</strong> {getStatusLabel(selectedOrder.status)}</p>
                  <p><strong>Teléfono:</strong> {selectedOrder.phoneNumber || "No disponible"}</p>
                  <p><strong>Dirección:</strong> {selectedOrder.address || "No disponible"}</p>
                  <p><strong>Método de pago:</strong> {selectedOrder.paymentMethod || "No disponible"}</p>
                  <p><strong>Total:</strong> {formatCurrency(selectedOrder.total)}</p>
                  <section className="pos-v2-online-orders__items">
                    <h4>Items del pedido</h4>
                    {summarizeItems(selectedOrder.items).length > 0 ? (
                      <ul>
                        {summarizeItems(selectedOrder.items).map((item, index) => (
                          <li key={`${selectedOrder.id}-${item.name}-${index}`}>
                            {item.image ? <img src={item.image} alt={item.name} /> : null}
                            <div>
                              <strong>{item.name}</strong>
                              {item.itemType ? <small>{item.itemType === "Variant" ? "Variante" : "Producto"}</small> : null}
                              <small>{item.quantity} x {formatCurrency(item.price)}</small>
                            </div>
                            <span>{formatCurrency(item.price * item.quantity)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>Sin items disponibles en este pedido.</p>
                    )}
                  </section>
                  <div className="pos-v2-online-orders__actions">
                    <button type="button" onClick={() => updateStatus(selectedOrder.id, "ENTREGADO")} disabled={updatingOrderId === selectedOrder.id}>Aceptar</button>
                    <button type="button" onClick={() => updateStatus(selectedOrder.id, "CANCELADO")} disabled={updatingOrderId === selectedOrder.id}>Rechazar</button>
                    <button type="button" className="is-light" onClick={() => saveOrderPdf(selectedOrder)}>Guardar PDF</button>
                  </div>
                </>
              ) : null}
            </article>
          </section>
        ) : null}

        {printingOrder ? (
          <section className="pos-v2-online-orders__printable" aria-label={`PDF pedido ${printingOrder.id}`}>
            <header className="print-brand">
              {businessBranding.logo ? <img src={businessBranding.logo} alt={businessBranding.name} className="print-brand__logo" /> : null}
              <div>
                <h1>{businessBranding.name}</h1>
                <p>Ravekh POS · Tienda en línea</p>
              </div>
            </header>
            <h1>Pedido #{printingOrder.id}</h1>
            <div className="print-card">
              <p><strong>Cliente:</strong> {printingOrder.customerName || "No disponible"}</p>
              <p><strong>Estado:</strong> {printingOrder.status || "No disponible"}</p>
              <p><strong>Teléfono:</strong> {printingOrder.phoneNumber || "No disponible"}</p>
              <p><strong>Dirección:</strong> {printingOrder.address || "No disponible"}</p>
              <p><strong>Método de pago:</strong> {printingOrder.paymentMethod || "No disponible"}</p>
              <p><strong>Total:</strong> {formatCurrency(printingOrder.total)}</p>
            </div>
            <div className="print-card">
              <h2>Productos</h2>
              {summarizeItems(printingOrder.items).length > 0 ? (
                <ul>
                  {summarizeItems(printingOrder.items).map((item, index) => (
                    <li key={`print-${printingOrder.id}-${item.name}-${index}`}>
                      <div className="flex items-center gap-2">
                        {item.image ? <img src={item.image} alt={item.name} className="h-16 w-16 rounded-md" /> : null}
                        <span>{item.name} x{item.quantity}</span>
                      </div>
                      <strong>{formatCurrency(item.price * item.quantity)}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Sin items disponibles en este pedido.</p>
              )}
            </div>
          </section>
        ) : null}
      </section>
    </PosV2Shell>
  );
};
