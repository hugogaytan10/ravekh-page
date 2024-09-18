import React, { useContext, useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { getProductsByBusiness } from "./Petitions";
import { Producto } from "./Modelo/Producto";
import { motion } from "framer-motion";
import { AppContext } from "./Context/AppContext";
import logoWhasa from '../../assets/logo-whatsapp.svg'

interface MainCatalogoProps {
  idBusiness?: string;
}

export const MainCatalogo: React.FC<MainCatalogoProps> = () => {
  const { idBusiness } = useParams<{ idBusiness: string }>();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [telefono, setTelefono] = useState<string | null>(null);
  const context = useContext(AppContext);

  useEffect(() => {
    getProductsByBusiness(idBusiness || "1").then((data) => {
      setProductos(data || []);
      setTelefono(data[0].PhoneNumber || null);
      context.setPhoneNumber(data[0].PhoneNumber || null);
    });
  }, [idBusiness]);

  return (
    <div className="p-4 min-h-screen w-full max-w-screen-xl mx-auto"> 
      {/* Mostrar mensaje si no hay productos */}
      {productos.length === 0 ? (
        <div className="text-center mt-10">
          <h2 className="text-2xl font-semibold text-gray-700">
            No hay productos disponibles
          </h2>
          <p className="text-gray-500 mt-2">
            Por favor, vuelve a intentarlo más tarde o explora otras categorías.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.isArray(productos) &&
            productos.map((producto, index) => (
              <motion.div
                key={producto.Id}
                className="border rounded-lg shadow-md p-4 bg-white transform transition-transform hover:scale-105 hover:shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <NavLink to={`/catalogo/producto/${producto.Id}/${telefono}`}>
                  <img
                    src={producto.Image}
                    alt={producto.Name}
                    className="h-48 w-full object-cover mb-4 rounded"
                  />
                </NavLink>
                <h2 className="text-lg font-semibold text-gray-800 text-center">
                  {producto.Name}
                </h2>

                {/* Precio normal y promocional en un solo renglón */}
                <div className="flex justify-between items-center mt-2">
                  <p className="text-gray-600">Precio: ${producto.Price}</p>
                  {producto.PromotionPrice && (
                    <p className="text-red-500 line-through">
                      Promoción: ${producto.PromotionPrice}
                    </p>
                  )}
                </div>

                {/* Botón centrado */}
                <div className="flex justify-center mt-4">
                  <button className="bg-[#6D01D1] text-white py-2 px-6 rounded-full shadow-md hover:bg-[#5A01A8] transition-colors duration-300 ease-in-out transform hover:scale-105">
                    Añadir al carrito
                  </button>
                </div>
              </motion.div>
            ))}
        </div>
      )}

      {/* Botón de WhatsApp */}
      <div className="bg-color-whats rounded-full p-1 fixed right-2 bottom-4">
        <a href={`https://api.whatsapp.com/send?phone=52${telefono}`}>
          <img src={logoWhasa} alt="WS" className="h-12 w-12" />
        </a>
      </div>
    </div>
  );
};
