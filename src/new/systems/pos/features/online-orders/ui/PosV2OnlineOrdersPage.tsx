import { useEffect, useMemo, useState } from "react";
import { ModernSystemsFactory } from "../../../../../index";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import "./PosV2OnlineOrdersPage.css";

const TOKEN_KEY = "pos-v2-token";
const BUSINESS_ID_KEY = "pos-v2-business-id";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://apipos.ravekh.com/api/";

export const PosV2OnlineOrdersPage = () => {
  const [token] = useState(() => window.localStorage.getItem(TOKEN_KEY) ?? "");
  const [businessId] = useState(() => Number(window.localStorage.getItem(BUSINESS_ID_KEY) ?? ""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Array<{ id: number; customerName: string; status: string; total: number }>>([]);

  const page = useMemo(() => {
    const factory = new ModernSystemsFactory(API_BASE_URL);
    return factory.createPosOnlineOrderPage();
  }, []);

  const loadOrders = async () => {
    if (!token || !Number.isFinite(businessId) || businessId <= 0) {
      setError("No hay sesión activa para cargar pedidos en línea.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const rows = await page.loadPendingOrders(businessId, token);
      setOrders(rows);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible cargar pedidos en línea.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <PosV2Shell title="Tienda en línea" subtitle="Pedidos pendientes del canal online">
      <section className="pos-v2-online-orders">
        <header>
          <h2>Pedidos online pendientes</h2>
          <button type="button" onClick={loadOrders}>Actualizar</button>
        </header>

        {error ? <p className="pos-v2-online-orders__error">{error}</p> : null}
        {loading ? <p>Cargando pedidos...</p> : null}

        {!loading ? (
          <ul>
            {orders.map((order) => (
              <li key={order.id}>
                <strong>Pedido #{order.id}</strong>
                <span>{order.customerName}</span>
                <small>{order.status}</small>
                <small>${order.total.toFixed(2)}</small>
              </li>
            ))}
            {orders.length === 0 ? <li className="is-empty">No hay pedidos pendientes.</li> : null}
          </ul>
        ) : null}
      </section>
    </PosV2Shell>
  );
};
