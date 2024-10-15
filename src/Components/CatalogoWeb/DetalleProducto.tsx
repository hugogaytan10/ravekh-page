import React, { useContext, useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Producto } from "./Modelo/Producto";
import { getProductById } from "./Petitions";
import { AppContext } from "./Context/AppContext";
import logoWhasa from "../../assets/logo-whatsapp.svg";
import cart from "../../assets/cart-outline.svg";
import { Helmet, HelmetProvider } from "react-helmet-async";

export const DetalleProducto: React.FC = () => {
  const { idProducto, telefono } = useParams<{
    idProducto: string;
    telefono: string;
  }>();
  const [producto, setProducto] = useState<Producto | null>(null);
  const context = useContext(AppContext);
  const [count, setCount] = useState(1);

  // Función para generar un descuento aleatorio entre 10% y 30%
  function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  // Función para añadir el producto al carrito con la cantidad seleccionada
  const addCart = () => {
    if (!producto) return;
    const productoCantidad: Producto = {
      ...producto,
      Quantity: count,
    };
    context.addProductToCart(productoCantidad);
  };

  useEffect(() => {
    const menuIcono = document.getElementById("menuIcono");
    menuIcono?.classList.add("hidden");

    const menuNavegacion = document.getElementById("menuIconoCatalogo");
    menuNavegacion?.classList.remove("hidden");

    //ocultamos la imagen del menu
    const menuImagen = document.getElementById("imgCatalogo");
    menuImagen?.classList.add("hidden");

    //mostramos la flecha de regreso
    const arrowIcon = document.getElementById("backCatalogo");
    arrowIcon?.classList.remove("hidden");

    getProductById(idProducto || "1").then((data) => {
      setProducto(data);
    });
  }, [idProducto]);

  if (!producto) {
    return (
      <div className="text-center text-red-500">Producto no encontrado</div>
    );
  }

  return (
    <HelmetProvider>
      <Helmet>
        <meta name="theme-color" content="#6D01D1" />
      </Helmet>
      <div className="px-6 py-20 min-h-screen bg-gray-100">
        {/* Contenedor del producto */}
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          {/* Imagen del producto con animación */}
          <motion.img
            src={producto.Image}
            alt={producto.Name}
            className="w-full h-96 object-cover rounded-lg mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />

          {/* Nombre del producto y precios */}
          <h1 className="text-4xl font-bold text-gray-900">{producto.Name}</h1>

          <div className="flex justify-between items-center mb-4 w-full">
            <div className="flex items-center space-x-4">
              {" "}
              {/* Añadir espacio entre los elementos */}
              {/* Precio del producto */}
              <div className="text-2xl font-extrabold text-gray-900">
                ${producto.Price}
              </div>
              {/* Cuadro de descuento alineado */}
              <div className="flex items-center justify-center bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg shadow-lg text-sm md:text-base lg:text-lg">
                <p>nuevo</p>
              </div>
            </div>

            {/* Precio promocional */}
            {producto.PromotionPrice && (
              <span className="line-through text-gray-400 text-sm">
                ${producto.PromotionPrice}
              </span>
            )}
          </div>

          {/* Descripción del producto */}
          <div className="my-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Descripción
            </h2>
            <p className="text-gray-600">{producto.Description}</p>
          </div>

          {/* Contador de cantidad */}
          <div className="flex justify-center items-center space-x-6 mt-6">
            <button
              className="bg-gray-200 text-gray-900 w-10 h-10 rounded-full hover:bg-gray-300 transition"
              onClick={() => {
                if (count > 1) setCount(count - 1);
              }}
            >
              -
            </button>
            <span className="text-2xl font-semibold">{count}</span>
            <button
              className="bg-gray-200 text-gray-900 w-10 h-10 rounded-full hover:bg-gray-300 transition"
              onClick={() => setCount(count + 1)}
            >
              +
            </button>
          </div>

          {/* Botón de añadir al carrito */}
          <div className="flex justify-center mt-10">
            <button
              className="bg-[#6D01D1] w-full md:w-3/4 text-white py-3 px-6 rounded-full shadow-lg hover:bg-[#5A01A8] transition-all duration-300 ease-in-out transform hover:scale-105"
              onClick={addCart}
            >
              Añadir al carrito
            </button>
          </div>
        </div>

        {/* Botón de WhatsApp */}
        <div className="bg-green-500 hover:bg-green-600 rounded-full p-2 fixed right-2 bottom-4 shadow-lg transition-all">
          <a href={`https://api.whatsapp.com/send?phone=52${telefono}`}>
            <img src={logoWhasa} alt="WhatsApp" className="w-10 h-10" />
          </a>
        </div>
      </div>
    </HelmetProvider>
  );
};