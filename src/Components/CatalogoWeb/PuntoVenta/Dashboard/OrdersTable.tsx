import React, { useState, useEffect } from "react";
import { getDetailsThisMonth, getDetailsToday } from "./Petitions";

interface Product {
  name: string;
  quantity: number;
  amount: number;
  image?: string;
}

interface Order {
  id: number;
  address: string | null;
  date: string;
  products: Product[];
}

const OrdersTable: React.FC<{ businessId: string; token: string }> = ({
  businessId,
  token,
}) => {
  const [data, setData] = useState<Order[]>([]); // Datos de los pedidos
  const [range, setRange] = useState<"Día" | "Mes">("Día"); // Selección de rango

  // Obtener datos de la API
  const fetchOrders = async () => {
    try {
      const orders =
        range === "Día"
          ? await getDetailsToday(businessId, token)
          : await getDetailsThisMonth(businessId, token);
      setData(orders);
    } catch (error) {
      console.error(error);
      setData([]);
    }
  };

  // Efecto para cargar datos cada vez que se cambia el rango
  useEffect(() => {
    fetchOrders();
  }, [range]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Reporte de Ventas</h3>
        {/* Selector de rango */}
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as "Día" | "Mes")}
          className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
        >
          <option value="Día">Día</option>
          <option value="Mes">Mes</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Cantidad
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Monto
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Dirección
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Fecha
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center text-gray-500 py-4 italic"
                >
                  No hay datos disponibles
                </td>
              </tr>
            ) : (
              data.map((order) => (
                <React.Fragment key={order.id}>
                  <tr>
                    <td
                      colSpan={5}
                      className="bg-gray-50 text-sm text-gray-600 px-6 py-3"
                    >
                      Pedido #{order.id} -{" "}
                      {new Date(order.date).toLocaleString()}
                    </td>
                  </tr>
                  {order.products.map((product, index) => (
                    <tr key={`${order.id}-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-3 flex items-center space-x-3">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : null}
                        <span className="text-sm font-medium text-gray-800">
                          {product.name}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {product.quantity}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        ${product.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {order.address || "Sin dirección"}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {new Date(order.date).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersTable;
