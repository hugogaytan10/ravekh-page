import React, { useState, useEffect } from 'react';
import { getDetailsThisMonth, getDetailsToday } from './Petitions';

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

export const OrdersTable: React.FC<{ businessId: string; token: string }> = ({ businessId, token }) => {
  const [data, setData] = useState<Order[]>([]); // Datos de los pedidos
  const [range, setRange] = useState<'Día' | 'Mes'>('Mes'); // Selección de rango
  const [sortBy, setSortBy] = useState<keyof Order | null>(null); // Columna para ordenar
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc'); // Dirección de ordenamiento

  // Función para obtener datos de la API
  const fetchOrders = async () => {
    try {
      const orders =
        range === 'Día'
          ? await getDetailsToday(businessId, token)
          : await getDetailsThisMonth(businessId, token);
      setData(orders);
    } catch (error) {
      console.error(error);
      setData([]);
    }
  };

  // Función para manejar el clic en el encabezado de la tabla
  const handleSort = (column: keyof Order) => {
    if (sortBy === column) {
      // Si ya se está ordenando por esta columna, invertir dirección
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Ordenar por una nueva columna
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Ordenar datos en base a columna y dirección seleccionada
  const sortedData = [...data].sort((a, b) => {
    if (!sortBy) return 0; // Si no se selecciona columna, no ordenar
    const valueA = a[sortBy];
    const valueB = b[sortBy];
    if (valueA === null || valueB === null) return 0; // Manejar valores nulos

    if (typeof valueA === 'string' && typeof valueB === 'string') {
      // Ordenar cadenas
      return sortDirection === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }

    if (typeof valueA === 'number' && typeof valueB === 'number') {
      // Ordenar números
      return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
    }

    // Ordenar fechas
    if (sortBy === 'date' && typeof valueA === 'string' && typeof valueB === 'string') {
      return sortDirection === 'asc'
        ? new Date(valueA).getTime() - new Date(valueB).getTime()
        : new Date(valueB).getTime() - new Date(valueA).getTime();
    }

    return 0;
  });

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

      <table className="min-w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th
              onClick={() => handleSort('id')}
              className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-600 cursor-pointer"
            >
              Nombre del Producto
            </th>
            <th
              onClick={() => handleSort('date')}
              className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-600 cursor-pointer"
            >
              Fecha de Encargo {sortBy === 'date' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-600">
              Cantidad
            </th>
            <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-600">
              Monto
            </th>
            <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-600">
              Estatus
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center text-gray-500 py-4">
                No hay datos disponibles
              </td>
            </tr>
          ) : (
            sortedData.map((order) =>
              order.products.map((product, index) => (
                <tr key={`${order.id}-${index}`} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2 flex items-center space-x-4">
                    {product.image ? (
                      <div className="flex items-center space-x-2">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <span className="text-sm font-medium text-gray-800">{product.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-gray-800">{product.name}</span>
                    )}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">
                    {new Date(order.date).toLocaleString()}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">
                    {product.quantity}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">
                    ${product.amount}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-white ${
                        product.quantity > 1 ? 'bg-green-500' : 'bg-yellow-500'
                      }`}
                    >
                      {product.quantity > 1 ? 'Entregado' : 'Pendiente'}
                    </span>
                  </td>
                </tr>
              ))
            )
          )}
        </tbody>
      </table>
    </div>
  );
};
