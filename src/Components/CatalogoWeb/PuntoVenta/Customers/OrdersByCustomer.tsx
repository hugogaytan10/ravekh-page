import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";
import { getSales } from "./Petitions";
import MoneyIcon from "../../../../assets/POS/MoneyIcon";
import { ChevronBack } from "../../../../assets/POS/ChevronBack";

interface Order {
  Id: number;
  Total: number;
  PaymentMethod: string;
  Date: string;
  Status: string;
}

export const OrdersByCustomer: React.FC = () => {
  const { customerId, period } = useParams<{ customerId: string; period: string }>();
  const navigate = useNavigate();
  const context = useContext(AppContext);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSales = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getSales(customerId || "", period || "", context.user.Token);
        setOrders(response || []);
      } catch (err) {
        setError("Error al cargar las ventas.");
      } finally {
        setLoading(false);
      }
    };

    loadSales();
  }, [customerId, period, context.user.Token]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PEDIDO":
        return "text-blue-500";
      case "ENTREGADO":
        return "text-green-500";
      case "CANCELADO":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  const renderSale = (order: Order) => (
    <div
      key={order.Id}
      className={`flex items-center p-4 bg-white shadow rounded-lg mb-4 border-l-4 ${getStatusColor(order.Status)}`}
      onClick={() => navigate(`/order-details/${order.Id}`)}
    >
      <div className="flex justify-center items-center w-12 h-12 rounded-full bg-gray-200 mr-4">
        <MoneyIcon width={30} height={30} />
      </div>
      <div className="text-left">
        <p className="text-lg font-semibold text-gray-800">${order.Total.toFixed(2)}</p>
        <p className="text-sm text-gray-600">{order.PaymentMethod}</p>
        <p className="text-sm text-gray-500">
          {new Date(order.Date).toLocaleDateString()} - {new Date(order.Date).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="loader mb-4"></div>
          <p className="text-gray-600">Cargando ventas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-red-500 font-semibold">{error}</p>
          <button
            onClick={() => navigate(0)}
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header
        className="flex items-center justify-between  bg-blue-600 text-white border-b shadow z-50"
        style={{ backgroundColor: context.store?.Color || "#3B82F6" }}
      >
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-blue-700"
        >
          <ChevronBack />
        </button>
        <h1 className="text-xl font-bold">Órdenes</h1>
        <button
          className="bg-white text-blue-600 font-semibold py-2 md:px-2 rounded-full shadow hover:bg-gray-100"
          onClick={() => navigate(`/edit-customer/${customerId}`)}
        >
          Editar Cliente
        </button>
      </header>

      {orders.length > 0 ? (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map(renderSale)}
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600">No hay ventas disponibles.</p>
        </div>
      )}
    </div>
  );
};
