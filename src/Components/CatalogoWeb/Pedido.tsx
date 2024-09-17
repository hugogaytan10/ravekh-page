import React, { useContext, useState } from 'react';
import { AppContext } from './Context/AppContext';
import { Producto } from './Modelo/Producto';

export const Pedido: React.FC = () => {
  const { cart, phoneNumber: storePhoneNumber } = useContext(AppContext); // Número de la tienda
  const [nombre, setNombre] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [clientPhoneNumber, setClientPhoneNumber] = useState<string>(''); // Número del cliente
  const [deliveryMethod, setDeliveryMethod] = useState<string>('domicilio');
  const [paymentMethod, setPaymentMethod] = useState<string>('transferencia');

  const totalArticulos = cart.reduce((total, item) => total + (item.Quantity || 1), 0);
  const totalPrecio = cart.reduce((total, item) => total + item.Price * (item.Quantity || 1), 0);

  return (
    <div className="p-6">
      {/* Resumen del pedido */}
      <h1 className="text-2xl font-semibold mb-4">Preparemos su pedido</h1>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Su pedido</h2>
        {cart.map((producto: Producto) => (
          <div key={producto.Id} className="flex justify-between items-center mb-4">
            {/* Imagen del producto */}
            <img src={producto.Image} alt={producto.Name} className="w-16 h-16 object-cover rounded-lg mr-4" />
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{producto.Name}</span>
              <span className="text-gray-600">${producto.Price} x {producto.Quantity || 1}</span>
            </div>
          </div>
        ))}
        <div className="flex justify-between items-center mt-4 font-semibold">
          <span>Total artículos ({totalArticulos} artículo{totalArticulos > 1 ? 's' : ''})</span>
          <span>${totalPrecio.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center mt-2 font-semibold">
          <span>Importe total</span>
          <span>${totalPrecio.toFixed(2)}</span>
        </div>
      </div>

      {/* Formulario para el nombre y contacto */}
      <div className="bg-white p-4 rounded-lg shadow-md mt-6">
        <h2 className="text-xl font-semibold mb-4">Información necesaria</h2>
        <div className="mb-4">
          <label className="block text-gray-700">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"
            placeholder="Introduce tu nombre"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email (opcional)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"
            placeholder="Introduce tu email"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Teléfono móvil</label>
          <input
            type="text"
            value={clientPhoneNumber}
            onChange={(e) => setClientPhoneNumber(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"
            placeholder="Introduce tu teléfono"
          />
        </div>
      </div>

      {/* Método de entrega */}
      <div className="bg-white p-4 rounded-lg shadow-md mt-6">
        <h2 className="text-xl font-semibold mb-4">¿Cómo desea recibir su pedido?</h2>
        <div className="mb-4">
          <label className="block text-gray-700">Método de entrega</label>
          <select
            value={deliveryMethod}
            onChange={(e) => setDeliveryMethod(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"
          >
            <option value="domicilio">Entrega a domicilio</option>
            <option value="recoger">Recoger en tienda</option>
          </select>
        </div>
      </div>

      {/* Método de pago */}
      <div className="bg-white p-4 rounded-lg shadow-md mt-6">
        <h2 className="text-xl font-semibold mb-4">Seleccione un método de pago</h2>
        <div className="mb-4">
          <label className="block text-gray-700">Método de pago</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"
          >
            <option value="transferencia">Transferencia bancaria</option>
            <option value="dinero">Dinero</option>
            <option value="tarjeta">Tarjetas de crédito y débito</option>
            <option value="enlace">Enlace de pago</option>
          </select>
        </div>
      </div>

      {/* Botón para continuar */}
      <div className="flex justify-center mt-6">
        <button className="bg-[#6D01D1] text-white py-3 px-8 rounded-full shadow-md hover:bg-[#5A01A8] transition-colors duration-300 ease-in-out">
          PREPARAR EL PEDIDO
        </button>
      </div>

      {/* Mostrar el número de la tienda */}
      <div className="mt-6 text-center">
        <p className="text-gray-600">Contacto de la tienda: {storePhoneNumber}</p>
      </div>
    </div>
  );
};
