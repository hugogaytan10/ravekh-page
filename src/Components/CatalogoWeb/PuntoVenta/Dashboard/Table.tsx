import React from 'react';

interface TableProps {
  data: {
    productName: string;
    address: string;
    orderDate: string;
    quantity: number;
    amount: string;
    status: 'Entregado' | 'Pendiente';
  }[];
}

export const Table: React.FC<TableProps> = ({ data }) => {
  return (
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
          {data.map((item, index) => (
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

