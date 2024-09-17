import React, { useContext, useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Producto } from "./Modelo/Producto";
import { getProductById } from "./Petitions";
import { AppContext } from "./Context/AppContext";
import logoWhasa from "../../assets/logo-whatsapp.svg";
import cart from "../../assets/cart-outline.svg";
export const DetalleProducto: React.FC = () => {
  const { idProducto, telefono } = useParams<{
    idProducto: string;
    telefono: string;
  }>();
  const [producto, setProducto] = useState<Producto | null>(null);
  const context = useContext(AppContext);
  useEffect(() => {
    getProductById(idProducto || "1").then((data) => {
      setProducto(data);
    });
  }, [idProducto]);
  if (!producto) {
    return <div>Producto no encontrado</div>;
  }

  return (
    <div className="p-6 min-h-screen">
      {/* Imagen del producto */}
      <motion.img
        src={producto.Image}
        alt={producto.Name}
        className="w-full h-96 object-cover rounded-lg shadow-md mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Nombre y precios */}
      <div className="flex justify-between items-center mb-4">
        
        <NavLink to={'/catalogo/pedido'}>
        <div className="bg-[#6D01D1] rounded-full p-1 absolute top-1 right-14">
          <img src={cart} alt="cart" className="w-8 h-8" />
          {context.cart.length > 0 && (
            <span className="absolute top-0 right-0 bg-indigo-800 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
              {context.cart.length}
            </span>
          )}
        </div>
        </NavLink>

        <h1 className="text-3xl font-bold text-gray-900">{producto.Name}</h1>
        <div>
          <p className="text-lg text-gray-700">Precio: ${producto.Price}</p>
          {producto.PromotionPrice && (
            <p className="text-lg text-red-500 line-through">
              Promoción: ${producto.PromotionPrice}
            </p>
          )}
        </div>
      </div>

      {/* Descripción */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Descripción</h2>
        <p className="text-gray-600 mt-2">{producto.Description}</p>
      </div>

      {/* Información adicional */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Detalles del Producto
        </h2>
        <ul className="mt-2 space-y-2">
          {producto.Stock !== null && (
            <li className="text-gray-600">Stock: {producto.Stock}</li>
          )}
          {producto.ExpDate && (
            <li className="text-gray-600">Expira el: {producto.ExpDate}</li>
          )}
        </ul>
      </div>

      {/* Botón para agregar al carrito */}
      <div className="flex justify-center mt-6">
        <button
          className="bg-[#6D01D1] text-white py-2 px-6 rounded-full shadow-md hover:bg-[#5A01A8] transition-colors duration-300 ease-in-out transform hover:scale-105"
          onClick={() => context.addProductToCart(producto)}
        >
          Añadir al carrito
        </button>
      </div>

      <div className="bg-color-whats rounded-full p-1 fixed right-2 bottom-4">
        <a href={`https://api.whatsapp.com/send?phone=52${telefono}`}>
          <img src={logoWhasa} alt="WS" />
        </a>
      </div>
    </div>
  );
};
