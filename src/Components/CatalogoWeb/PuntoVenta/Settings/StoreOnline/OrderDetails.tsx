import React, { useState, useEffect, useContext, useRef } from "react";
import { AppContext } from "../../../Context/AppContext";
import { getOrderDetails, updateOrderStatus } from "./Petitions";
import { useNavigate, useParams } from "react-router-dom";
import { PrintTicket } from "../../Printer/PrintTicket";
import { ChevronBack } from "../../../../../assets/POS/ChevronBack";

export const OrderDetailScreen: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);
  const [orderDetails, setOrderDetails] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loaderButtonAcept, setLoaderButtonAcept] = useState(false);
  const context = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    getOrderDetails(orderId || "", context.user.Token || "").then((data) => {
      if (data) {
        setOrder(data.order);
        setOrderDetails(data.orderDetails);
        const cartItems = data.orderDetails.map((detail: any) => ({
          Id: detail.Id,
          Name: detail.Name,
          Price: detail.Price,
          Quantity: detail.Item_Quantity,
          Image: detail.Image,
        }));
        setCart(cartItems);
        const total = data.orderDetails.reduce(
          (acc: number, detail: any) =>
            acc + detail.Price * detail.Item_Quantity,
          0
        );
        setTotal(total);
      }
    });
  }, [orderId, context.user.Token]);

  const handleAcceptOrder = () => {
    setLoaderButtonAcept(true);
    updateOrderStatus(orderId || "", "ENTREGADO", context.user.Token).then(
      () => {
        context.setCart(cart);
        navigate(-1);
      }
    );
  };

  const handleRejectOrder = () => {
    updateOrderStatus(orderId || "", "CANCELADO", context.user.Token).then(
      () => {
        navigate(-1);
      }
    );
  };

  if (!order) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-700">
          Cargando detalles de la orden...
        </p>
      </div>
    );
  }

  return (
    <div className="">
      <header className="flex items-center bg-gray-800 text-white py-4 px-6">
        <button
          onClick={() => {
            navigate(-1);
          }}
          className="mr-4 text-white"
        >
          <ChevronBack />
        </button>
        <h1 className="text-lg font-bold">Detalle de Orden</h1>
      </header>

      <section className="my-6 p-4">
        <h2 className="text-xl font-semibold mb-2">Información del Cliente</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p>
            <span className="font-semibold">Cliente:</span> {order.Name}
          </p>
          <p>
            <span className="font-semibold">Teléfono:</span> {order.PhoneNumber}
          </p>
        </div>
      </section>

      <section className="my-6 p-4">
        <h2 className="text-xl font-semibold mb-2">Dirección de Envío</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p>
            <span className="font-semibold">Dirección:</span> {order.Address}
          </p>
        </div>
      </section>

      <section className="my-6 p-4">
        <h2 className="text-xl font-semibold mb-2">Detalles de la Orden</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p>
            <span className="font-semibold">Estatus:</span> {order.Status}
          </p>
          <p>
            <span className="font-semibold">Método de Pago:</span>{" "}
            {order.PaymentMethod || "No especificado"}
          </p>
        </div>
      </section>

      <section className="my-6 p-4">
        <h2 className="text-xl font-semibold mb-2">Productos</h2>
        {orderDetails.map((detail) => (
          <div
            key={detail.Id}
            className="bg-white p-4 rounded shadow flex items-center mb-4"
          >
            <img
              src={detail.Image}
              alt={detail.Name}
              className="w-20 h-20 rounded mr-4"
            />
            <div>
              <p className="font-semibold text-gray-800">{detail.Name}</p>
              <p>Precio: ${detail.Price}</p>
              <p>Cantidad: {detail.Item_Quantity}</p>
              <p>Subtotal: ${detail.Price * detail.Item_Quantity}</p>
            </div>
          </div>
        ))}
      </section>

      <footer className="flex justify-between mt-6 mb-6 p-4">
        <button
          onClick={handleAcceptOrder}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          disabled={loaderButtonAcept}
        >
          {loaderButtonAcept ? "Procesando..." : "Aceptar Pedido"}
        </button>

        <button
          onClick={handleRejectOrder}
          className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
        >
          Rechazar Pedido
        </button>

        <button
          onClick={() => {
            PrintTicket(context.store.Name, cart, total, 0);
          }}
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
        >
          Imprimir Ticket
        </button>
      </footer>
    </div>
  );
};
