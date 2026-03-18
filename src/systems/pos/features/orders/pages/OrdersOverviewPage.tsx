import { useEffect, useMemo, useState } from "react";
import { PosOrdersApi } from "../api/PosOrdersApi";
import type { Order, OrderStatus } from "../model/Order";
import { ManageOrdersService } from "../services/ManageOrdersService";

interface OrdersOverviewPageProps {
  token: string;
  businessId: number;
}

export const OrdersOverviewPage = ({ token, businessId }: OrdersOverviewPageProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const service = useMemo(() => {
    const repository = new PosOrdersApi(token);
    return new ManageOrdersService(repository);
  }, [token]);

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      setStatus("loading");
      const result = await service.loadBusinessOrders(businessId);

      if (!isMounted) {
        return;
      }

      if (!result.ok) {
        setStatus("error");
        setErrorMessage(result.error);
        return;
      }

      setOrders(result.data);
      setStatus("idle");
      setErrorMessage("");
    };

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, [businessId, service]);

  const visibleOrders = useMemo(() => service.filterByStatus(orders, statusFilter), [orders, service, statusFilter]);
  const totalRevenue = useMemo(() => service.calculateTotalRevenue(visibleOrders), [service, visibleOrders]);

  return (
    <section>
      <h2>POS Orders (Modern)</h2>

      <label htmlFor="pos-orders-filter">Status</label>
      <select
        id="pos-orders-filter"
        value={statusFilter}
        onChange={(event) => setStatusFilter(event.target.value as OrderStatus | "ALL")}
      >
        <option value="ALL">All</option>
        <option value="PENDING">Pending</option>
        <option value="IN_PROGRESS">In progress</option>
        <option value="DELIVERED">Delivered</option>
        <option value="CANCELLED">Cancelled</option>
      </select>

      {status === "loading" && <p>Loading orders...</p>}
      {status === "error" && <p role="alert">Unable to load orders: {errorMessage}</p>}

      {status === "idle" && (
        <>
          <p>Total orders: {visibleOrders.length}</p>
          <p>Total revenue: ${totalRevenue.toFixed(2)}</p>
          <ul>
            {visibleOrders.map((order) => (
              <li key={order.id}>
                #{order.id} · {order.customerName} · ${order.total.toFixed(2)} · {order.status}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
};
