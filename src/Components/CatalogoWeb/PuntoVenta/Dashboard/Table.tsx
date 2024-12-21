import React, { useState, useEffect } from 'react';
import { getDetailsThisMonth, getDetailsToday } from './Petitions';

interface Product {
  productName: string;
  address: string;
  orderDate: string;
  quantity: number;
  amount: string;
  status: 'Entregado' | 'Pendiente';
}

export const Table: React.FC<{ businessId: string; token: string }> = ({ businessId, token }) => {
  const [data, setData] = useState<Product[]>([]); // Datos de los pedidos
  const [range, setRange] = useState<'Día' | 'Mes'>('Día'); // Selección de rango

  // Función para obtener datos de la API
  const fetchOrders = async () => {
    try {
      const orders =
        range === 'Día'
          ? await getDetailsToday(businessId, token)
          : await getDetailsThisMonth(businessId, token);

      // Transformar los datos al formato requerido
      const transformedData: Product[] = orders.map((order: any) => ({
        productName: order.products[0]?.name || 'Producto desconocido',
        address: order.address || 'Sin dirección',
        orderDate: new Date(order.date).toLocaleString(),
        quantity: order.products[0]?.quantity || 0,
        amount: `$${order.products[0]?.amount || 0}`,
        status: order.products[0]?.quantity > 1 ? 'Entregado' : 'Pendiente',
      }));
      setData(transformedData);
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
        <h3 className="text-lg font-medium text-gray-800">Reporte Pedidos</h3>
        {/* Selector de rango */}
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as 'Día' | 'Mes')}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
        >
          <option value="Día">Día</option>
          <option value="Mes">Mes</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre del Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dirección
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha de Encargo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cantidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-4">
                  No hay datos disponibles
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.productName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.address}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.orderDate}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.quantity}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.amount}</td>
                  <td
                    className={`px-6 py-4 text-sm font-medium ${
                      item.status === 'Entregado' ? 'text-green-600' : 'text-yellow-600'
                    }`}
                  >
                    {item.status}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
