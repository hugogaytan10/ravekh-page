
import React, { useContext, useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { getProductsByBusiness, getProductsByCategoryId, getProductsByCategoryIdAndDisponibilty } from "./Petitions";
import { Producto } from "./Modelo/Producto";
import { motion } from "framer-motion";
import { AppContext } from "./Context/AppContext";
import logoWhasa from "../../assets/logo-whatsapp.svg";
import { Helmet, HelmetProvider } from "react-helmet-async";

export const MainCategoria: React.FC = () => {
    const { idCategoria } = useParams<{
        idCategoria: string;
    }>();
    const [productos, setProductos] = useState<Producto[]>([]);
    const [telefono, setTelefono] = useState<string | null>(null);
    const context = useContext(AppContext);
    const [notPay, setNotPay] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
    const catalogoId =
        (context.idBussiness !== "0" ? context.idBussiness : localStorage.getItem("idBusiness")) ?? "";


    useEffect(() => {
        /*context.setIdBussiness(idBusiness);
        getProductsByBusiness(idBusiness).then((data) => {
          if (data.length === 0) {
            return;
          }
          setProductos(data || []);
          setTelefono(data[0].PhoneNumber || null);
          context.setPhoneNumber(data[0].PhoneNumber || null);
          localStorage.setItem("telefono", data[0].PhoneNumber || "");
        });*/
        //rescatamos el id del negocio del local storage
      
        if (idCategoria) {
            setLoadingProducts(true);
            getProductsByCategoryIdAndDisponibilty(idCategoria)
                .then((data) => {
                    setProductos(Array.isArray(data) ? data : []);
                })
                .finally(() => {
                    setLoadingProducts(false);
                });
        }
        if (!context.phoneNumber) {
            const storedPhoneNumber = localStorage.getItem("telefono");
            if (storedPhoneNumber) {
                context.setPhoneNumber(storedPhoneNumber);
                setTelefono(storedPhoneNumber);
            }
        }else{
            setTelefono(context.phoneNumber);
        }
    }, [context.idBussiness, idCategoria]);

    useEffect(() => {
        if (!context.phoneNumber) {
            const storedPhoneNumber = localStorage.getItem("telefono");
            if (storedPhoneNumber) {
                context.setPhoneNumber(storedPhoneNumber);
                setTelefono(storedPhoneNumber);
            }
        }else{
            setTelefono(context.phoneNumber);
        }
        const menuIcono = document.getElementById("menuIcono");
        //ocultamos ese menu
        menuIcono?.classList.add("hidden");
        //mostramos el menu de navegacion
        const menuNavegacion = document.getElementById("menuIconoCatalogo");
        menuNavegacion?.classList.remove("hidden");

        //mostramos la imagen del catalogo
        const menuImagen = document.getElementById("imgCatalogo");
        menuImagen?.classList.remove("hidden");

        //ocultamos la flecha de regreso
        const arrowIcon = document.getElementById("backCatalogo");
        arrowIcon?.classList.add("hidden");
    }, []);

    useEffect(() => {
        //rescatamos el id del negocio del local storage
        const storedIdBusiness = localStorage.getItem("idBusiness");
        if (storedIdBusiness && storedIdBusiness == "92") {
            setNotPay(true);
        }
    }, [productos]);

    const renderSkeleton = () => {
        return (
            <div className="p-2 rounded-md mb-20">
                <div className="bg-gray-200 animate-pulse h-10 w-full mb-4"></div>
                <div className="flex flex-wrap gap-4">
                    {[...Array(8)].map((_, index) => (
                        <div
                            key={index}
                            className="bg-gray-200 animate-pulse h-24 w-full md:w-2/5 lg:w-3/12 rounded-md"
                        ></div>
                    ))}
                </div>
            </div>
        );
    };

    if(notPay) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-2xl font-bold mb-4">Lo sentimos</h1>
                <p className="text-lg">No puedes comprar en esta tienda.</p>
                <p className="text-lg">Por favor, contacta a la tienda para más información.</p>
            </div>
        );
    }
    return (
        <HelmetProvider>
            <>
                <Helmet>
                    <meta name="theme-color" content="#F64301" />
                </Helmet>
                <div className="p-4 min-h-screen w-full max-w-screen-xl mx-auto py-20 mt-11">
                    {/* Mostrar mensaje si no hay productos */}
                    {loadingProducts ? (
                        renderSkeleton()
                    ) : productos &&
                    productos.length === 0 ? (
                        <div className="text-center mt-10">
                            <h2 className="text-2xl font-semibold text-gray-700">
                                No hay productos disponibles
                            </h2>
                            <p className="text-gray-500 mt-2">
                                Por favor, vuelve a intentarlo más tarde o explora otras
                                categorías.
                            </p>
                            {catalogoId && (
                                <NavLink
                                    to={catalogoId ? `/catalogo/${catalogoId}` : "/"}
                                    className="inline-flex mt-6 px-6 py-2 rounded-full text-white font-medium shadow-md"
                                    style={{ backgroundColor: context.color || "#F64301" }}
                                >
                                    Ver todo
                                </NavLink>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {Array.isArray(productos) &&
                                productos.map((producto, index) => {
                                    const mainImage = producto.Image || (producto.Images && producto.Images[0]);
                                    if (!mainImage) {
                                        return null;
                                    }
                                    return (
                                            <motion.div
                                                key={producto.Id}
                                                className="border rounded-lg shadow-md  bg-white transform transition-transform hover:scale-105 hover:shadow-lg"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                            >
                                                <NavLink
                                                    to={`/catalogo/producto/${producto.Id}/${telefono}`}
                                                >
                                                    <img
                                                        src={mainImage}
                                                        alt={producto.Name}
                                                        className="h-48 w-full object-cover mb-4 rounded-t-lg"
                                                    />
                                                </NavLink>
                                                <h2 className="text-lg font-semibold text-gray-800 text-center">
                                                    {producto.Name}
                                                </h2>

                                                {/* Precio normal y promocional en un solo renglón */}
                                                <div className="flex justify-between items-center mt-2 p-2">
                                                    {producto.PromotionPrice ? (
                                                        <>
                                                            <p className="text-gray-800 text-xl font-semibold">${producto.PromotionPrice}</p>
                                                            <p className="text-gray-300 line-through font-light">
                                                                ${producto.Price}
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <p className="text-gray-800 text-xl font-semibold">${producto.Price}</p>
                                                    )}
                                                </div>

                                                {/* Botón centrado */}
                                                <div className="flex justify-center mt-4 p-2">
                                                    <button
                                                        onClick={() => context.addProductToCart(producto)}
                                                        style={{ backgroundColor: context.color }}
                                                        className="text-white w-full md:w-3/4 py-1 px-4 rounded-full shadow-md hover:bg-[#990404] transition-colors duration-300 ease-in-out transform hover:scale-105"
                                                    >
                                                        Añadir al carrito
                                                    </button>
                                                </div>
                                            </motion.div>
                                    );
                                })}
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
