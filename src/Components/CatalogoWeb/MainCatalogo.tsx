import React, { useContext, useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { getBusinessById, getProductsByBusinessWithStock } from "./Petitions";
import { Producto } from "./Modelo/Producto";
import { motion } from "framer-motion";
import { AppContext } from "./Context/AppContext";
import logoWhasa from "../../assets/logo-whatsapp.svg";
import { Helmet, HelmetProvider } from "react-helmet-async";
import defaultImage from "../../assets/ravekh.png";

interface MainCatalogoProps {
  idBusiness?: string;
}

export const MainCatalogo: React.FC<MainCatalogoProps> = () => {
  const { idBusiness } = useParams<{ idBusiness: string }>();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(10); // Mostrar 10 inicialmente
  const [telefono, setTelefono] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [plan, setPlan] = useState<string | null>(null);

  const context = useContext(AppContext);

  // 1) useEffect principal: primero saca "plan" del negocio y luego productos
  useEffect(() => {
    
    (async () => {
      // Redirección especial si es "26"
      if (idBusiness === "26") {
        window.location.href = "https://mrcongelados.com/";
        return;
      }

      // Asegurar que el contexto tenga el ID del negocio
      if (idBusiness) {
        context.setIdBussiness(idBusiness);
      } else {
        context.setIdBussiness("1");
      }

      // Limpieza de carrito si no coincide el negocio
      const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const isDifferentBusiness = storedCart.some(
        (item: Producto) => item.Business_Id.toString() !== idBusiness
      );
      if (isDifferentBusiness || storedCart.length === 0) {
        localStorage.removeItem("cart");
        context.clearCart();
      }

      // 1.1) Obtener datos del negocio
      const dataBusiness = await getBusinessById(idBusiness || "1");
      if (dataBusiness) {
        setColor(dataBusiness.Color || null);
        context.setColor(dataBusiness.Color || null);
        localStorage.setItem("color", dataBusiness.Color || "");

        context.setNombre(dataBusiness.Name || null);
        localStorage.setItem("nombre", dataBusiness.Name || "");

        setPlan(dataBusiness.Plan);
      }

      // 1.2) Obtener productos con el plan real
      const dataProducts = await getProductsByBusinessWithStock(
        idBusiness || "1",
        dataBusiness?.Plan || ""
      );

      if (dataProducts.length > 0) {
        setProductos(dataProducts);
        setTelefono(dataProducts[0].PhoneNumber || null);
        context.setPhoneNumber(dataProducts[0].PhoneNumber || null);
        localStorage.setItem("telefono", dataProducts[0].PhoneNumber || "");
      } else {
        setProductos([]);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idBusiness]);

  // 2) Efecto para inicializar/ocultar elementos y cargar color/teléfono/nombre del localStorage si no están en contexto
  useEffect(() => {
    
    if (!context.phoneNumber) {
      const storedPhoneNumber = localStorage.getItem("telefono");
      if (storedPhoneNumber) {
        context.setPhoneNumber(storedPhoneNumber);
        setTelefono(storedPhoneNumber);
      }
    }
    if (!context.color) {
      const storedColor = localStorage.getItem("color");
      if (storedColor) {
        context.setColor(storedColor);
        setColor(storedColor);
      }
    }
    if (!context.nombre) {
      const storedNombre = localStorage.getItem("nombre");
      if (storedNombre) {
        context.setNombre(storedNombre);
      }
    }

    // Ajustes de elementos DOM
    const menuIcono = document.getElementById("menuIcono");
    menuIcono?.classList.add("hidden");
    const menuNavegacion = document.getElementById("menuIconoCatalogo");
    menuNavegacion?.classList.remove("hidden");
    const menuImagen = document.getElementById("imgCatalogo");
    menuImagen?.classList.remove("hidden");
    const arrowIcon = document.getElementById("backCatalogo");
    arrowIcon?.classList.add("hidden");
  }, [context]);

  // 3) Función para ajustar color en hover
  function adjustColor(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const newR = Math.max(0, r - 100).toString(16).padStart(2, "0");
    const newG = Math.max(0, g - 100).toString(16).padStart(2, "0");
    const newB = Math.max(0, b - 100).toString(16).padStart(2, "0");
    return `#${newR}${newG}${newB}`;
  }

  // 4) Scroll infinito: cargar 10 más
  const loadMore = () => {
    setVisibleCount((prev) => {
      const next = Math.min(prev + 10, productos.length);
      return next;
    });
  };

  // 5) Listener de scroll: cuando el usuario se acerca al final, cargamos más
  useEffect(() => {
    
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        loadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [productos.length]);

  // 6) Render
  return (
    <HelmetProvider>
      <>
        <Helmet>
          <meta name="theme-color" content={color || "#6D01D1"} />
          <title>{context.nombre || "Catálogo de Productos"}</title>
          <meta
            name="description"
            content="Explora nuestro catálogo de productos y encuentra todo lo que necesitas a precios increíbles. ¡Compra ahora!"
          />
          <meta property="og:type" content="website" />
          <meta
            property="og:title"
            content={context.nombre || "Catálogo de Productos"}
          />
          <meta
            property="og:description"
            content="Explora nuestro catálogo de productos y encuentra todo lo que necesitas a precios increíbles. ¡Compra ahora!"
          />
          <meta
            property="og:image"
            content={
              productos.length > 0 && productos[0].Image
                ? productos[0].Image
                : defaultImage
            }
          />
          <meta property="og:url" content={window.location.href} />
        </Helmet>

        <div className="p-4 min-h-screen w-full max-w-screen-xl mx-auto py-20 mt-8">
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
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {productos.slice(0, visibleCount).map((producto, index) => (
                producto.Image && (
                  <motion.div
                    key={producto.Id}
                    className="border rounded-lg shadow-md bg-white flex flex-col h-full transform transition-transform hover:scale-105 hover:shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <NavLink to={`/catalogo/producto/${producto.Id}/${telefono}`}>
                      <img
                        src={producto.Image}
                        alt={producto.Name}
                        className="h-48 w-full object-cover rounded-t-lg"
                      />
                    </NavLink>
                    <div className="flex flex-col flex-grow px-4 py-2">
                      <h2 className="text-lg font-semibold text-gray-800 text-center">
                        {producto.Name}
                      </h2>
                      <div className="flex justify-between items-center mt-2">
                        {producto.PromotionPrice ? (
                          <>
                            <p className="text-gray-800 text-xl font-semibold">
                              ${producto.PromotionPrice}
                            </p>
                            <p className="text-gray-300 line-through font-light">
                              ${producto.Price}
                            </p>
                          </>
                        ) : (
                          <p className="text-gray-800 text-xl font-semibold">
                            ${producto.Price}
                          </p>
                        )}
                      </div>
                      <p className="text-gray-600 text-justify text-sm mt-2 flex-grow">
                        {producto.Description}
                      </p>
                    </div>
                    <div className="p-4 mt-auto">
                      <button
                        onClick={() => context.addProductToCart(producto)}
                        style={{ backgroundColor: color || "#6D01D1" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = adjustColor(
                            color || "#6D01D1"
                          ))
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = color || "#6D01D1")
                        }
                        className="text-white w-full py-2 px-4 rounded-full shadow-md hover:transform hover:scale-105"
                      >
                        Añadir al carrito
                      </button>
                    </div>
                  </motion.div>
                )
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
      </>
    </HelmetProvider>
  );
};
