import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../../Context/AppContext';
import { IOrderCatalog } from '../../Model/orderCatalog';
import { getOrderCatalog } from './Petitions';

export const OrdersScreen: React.FC = () => {
  const [orders, setOrders] = useState<IOrderCatalog[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<IOrderCatalog[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>('PEDIDO');
  const context = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrderCatalog(
          String(context.user?.Business_Id),
          context.user?.Token
        );
        if (Array.isArray(data)) {
          setOrders(data);
          setFilteredOrders(data.filter(order => order.Status === 'PEDIDO'));
        } else {
          setOrders([]);
        }
      } catch (error) {
        setOrders([]);
      }
    };

    fetchOrders();
  }, [context.user?.Business_Id, context.user?.Token]);

  const filterOrders = (status: string | null) => {
    setSelectedStatus(status);
    if (status) {
      setFilteredOrders(
        orders.filter(order => order?.Status?.toLowerCase() === status.toLowerCase())
      );
    } else {
      setFilteredOrders(orders);
    }
  };

  const getStatusStyle = (status: string | undefined) => {
    switch (status) {
      case 'ENTREGADO':
        return 'text-green-600';
      case 'PEDIDO':
        return 'text-yellow-500';
      case 'CANCELADO':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header
        className="flex items-center p-4 text-white"
        style={{ backgroundColor: context.store.Color || '#3B82F6' }}
      >
        <button
          className="mr-4 p-2 rounded-full bg-opacity-20"
          onClick={() => navigate(-1)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        <h1 className="text-xl font-semibold">Órdenes</h1>
      </header>

      <div className="flex justify-around p-4 bg-white">
        {['PEDIDO', 'ENTREGADO', 'CANCELADO'].map(status => (
          <button
            key={status}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedStatus === status
                ? `text-white`
                : `text-${context.store.Color || 'blue-500'}`
            } ${
              selectedStatus === status
                ? `bg-${context.store.Color || 'blue-500'}`
                : 'bg-gray-200'
            }`}
            onClick={() => filterOrders(status)}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="p-4">
        {filteredOrders.length > 0 ? (
          <ul className="space-y-4">
            {filteredOrders.map(order => (
              <li
                key={order.Id}
                className="p-4 bg-white rounded-lg shadow-md border border-gray-200"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-gray-800">{order.Name}</h2>
                  <span className={`text-sm font-medium ${getStatusStyle(order.Status)}`}>
                    {order.Status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">📍 {order.Address}</p>
                <p className="text-sm text-gray-600">💳 {order.PaymentMethod}</p>
                <p className="text-sm text-gray-600">📞 {order.PhoneNumber}</p>
                {order.Delivery !== undefined && (
                  <p className="text-sm text-gray-600">🚚 Costo de entrega: {order.Delivery}</p>
                )}
                <button
                  className="mt-4 px-4 py-2 text-sm text-white rounded bg-blue-500 hover:bg-blue-600"
                  onClick={() => navigate(`/order-details/${order.Id}`)}
                >
                  Ver Detalles
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 mt-10">No hay órdenes disponibles.</p>
        )}
      </div>
    </div>
  );
};
