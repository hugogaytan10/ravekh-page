import React, { useRef, useEffect, useContext, useState, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LandingPage } from "../LandingPage/LandingPage";
import { BlogMain } from "../Blog/BlogMain";
import { MainArticulosIA } from "../Blog/ArticulosIA/MainArticulosIA";
import { ArticuloWhisper } from "../Blog/ArticulosIA/ArticuloWhisper/ArticuloWhisper";
import { MainArticulosReactNative } from "../Blog/ArticulosReactNative/MainArticulosReactNative";
import menu from "../../assets/menu.svg";
import "./Rutas.css";
import { gsap, TimelineMax } from "gsap";
import { ArticuloValeLaPenaReact } from "../Blog/ArticulosReactNative/ArticuloValeLaPenaReact/ArticuloValeLaPenaReact";
import { Productos } from "../Producto/Productos";
import { Muestra } from "../Muestra/Muestra";
import { Paquetes } from "../Paquetes/Muestra";
import { MainCatalogo } from "../CatalogoWeb/MainCatalogo";
import { DetalleProducto } from "../CatalogoWeb/DetalleProducto";
import { Pedido } from "../CatalogoWeb/Pedido";
import { AppContext } from "../CatalogoWeb/Context/AppContext";
import cart from "../../assets/cart-outline.svg";
import arrow from "../../assets/arrow-forward-white.svg";
import { PoliticaPrivacidad } from "../PoliticaPrivacidad/PoliticaPrivacidad";
import { RavekhPos } from "../RavekhPos/RavekhPos";
import { AuthPage } from "../CatalogoWeb/PuntoVenta/Login/AuthPage";
import { MainSales } from "../CatalogoWeb/PuntoVenta/Sales/MainSales";
export const Rutas = () => {
  //contexto
  const context = useContext(AppContext);
  const location = useLocation(); // Hook de react-router-dom para obtener la ubicación actual

  //lista de rutas donde NO queremos mostrar el menú
  const hiddenNavBarRoutes = ["/login-punto-venta", "/MainSales"];

  const menuIconRef = useRef(null);
  const slideDownRef = useRef(null);
  const listItemsRef = useRef(null);
  const menuToggle = useRef(null);

  //togle para el catalogo
  const catalogoIconRef = useRef(null);
  const slideDownRefCatalogo = useRef(null);
  const listItemsRefCatalogo = useRef(null);
  const menuToggleCatalogo = useRef(null);
  const [color, setcolor] = useState("");
  const [nombre, setnombre] = useState("");

  // Nueva referencia para el POS
  const slideDownRefPOS = useRef(null); // Referencia para el contenedor del menú
  const menuTogglePOS = useRef(null); // Referencia para la animación del menú

  useEffect(() => {
    if (listItemsRefCatalogo.current) {
      gsap.set(slideDownRefPOS.current, { y: "-100%", display: "block" });

      menuTogglePOS.current = new TimelineMax({
        paused: true,
        reversed: true,
      })
        .to(slideDownRefPOS.current, 1, { y: "0%", ease: "back.out(1.7)" })
        .staggerFrom(
          Array.from(listItemsRefCatalogo.current.children), // Convertir a array para seguridad
          0.25,
          {
            y: "-30",
            ease: "power1.out",
          },
          0.1
        );
    }
  }, []);

  useEffect(() => {
    if (context.cart.length === 0) {
      const localCart = localStorage.getItem("cart");
      if (localCart) {
        context.setCart(JSON.parse(localCart));
      }
    }
    if (slideDownRef) {
      gsap.set(slideDownRef.current, { y: "-100%", display: "block" });

      menuToggle.current = new TimelineMax({ paused: true, reversed: true })
        .to(menuIconRef.current, 0.5, { x: "-30", ease: "back.out(1.7)" })
        .to(slideDownRef.current, 1, { y: "0%", ease: "back.out(1.7)" })
        .staggerFrom(
          listItemsRef.current.children,
          0.25,
          {
            y: "-30",
            ease: "power1.out",
          },
          0.1
        );
    }

    if (slideDownRefCatalogo) {
      //togle para el catalogo
      gsap.set(slideDownRefCatalogo.current, { y: "-100%", display: "block" });

      menuToggleCatalogo.current = new TimelineMax({
        paused: true,
        reversed: true,
      })
        .to(catalogoIconRef.current, 0.5, { x: "10", ease: "back.out(1.7)" })
        .to(slideDownRefCatalogo.current, 1, { y: "0%", ease: "back.out(1.7)" })
        .staggerFrom(
          listItemsRefCatalogo.current.children,
          0.25,
          {
            y: "-30",
            ease: "power1.out",
          },
          0.1
        );
    }
  }, []);

  useEffect(() => {
    const localColor = localStorage.getItem("color");
    const localNombre = localStorage.getItem("nombre");
    const localCart = localStorage.getItem("cart");

    if (localColor) {
      context.setColor(localColor);
      setcolor(localColor);
    }

    if (localNombre) {
      context.setNombre(localNombre);
      setnombre(localNombre);
    }
  }, []);

  useEffect(() => {
    if (context.color !== "") {
      setcolor(context.color);
    }
    if (context.nombre !== "") {
      setnombre(context.nombre);
    }
  }, [context.color, context.nombre]);

  const handleMenuClick = () => {
    menuToggle.current.reversed()
      ? menuToggle.current.restart()
      : menuToggle.current.reverse();
  };

  const handleMenuClickCatalogo = () => {
    menuToggleCatalogo.current.reversed()
      ? menuToggleCatalogo.current.restart()
      : menuToggleCatalogo.current.reverse();
  };

  useEffect(() => {
    const localColor = localStorage.getItem("color");
    const localNombre = localStorage.getItem("nombre");
    if (localColor) {
      context.setColor(localColor);
      setcolor(localColor);
    }
    if (localNombre) {
      context.setNombre(localNombre);
      setnombre(localNombre);
    }
  }, []);

  // Función para determinar si se debe mostrar el navbar
  const shouldShowNavbar = useMemo(() => {
    const hiddenRoutes = ["/login-punto-venta", "/MainSales"];
    return !hiddenRoutes.includes(location.pathname);
  }, [location.pathname]);

  return (
    <div className="drawer ">
      <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />

      <div className="  drawer-content flex flex-col h-full min-w-full relative ">
        {shouldShowNavbar && (
          <div
            ref={menuIconRef}
            className="z-40 nav-menu bg-white w-10 h-10 rounded-full flex items-center justify-center fixed top-2 right-1"
            onClick={handleMenuClick}
            id="menuIcono"
          >
            <img src={menu} alt="menu" className="h-10 w-10" />
          </div>
        )}

        {shouldShowNavbar && (
          <nav
            ref={slideDownRef}
            className="menu-container fixed top-0 left-0 w-full h-full z-30"
            style={{ display: "none", backgroundColor: "#6D01D1" }}
          >
            <ul
              ref={listItemsRef}
              className="list-items flex flex-col items-center justify-center h-full"
            >
              <li>
                <NavLink to="/" onClick={handleMenuClick}>
                  Inicio
                </NavLink>
              </li>
              <li>
                <NavLink to="/proyectos" onClick={handleMenuClick}>
                  Proyectos
                </NavLink>
              </li>
              <li>
                <NavLink to="/paquetes" onClick={handleMenuClick}>
                  Paquetes
                </NavLink>
              </li>
              <li>
                <NavLink to="/blog" onClick={handleMenuClick}>
                  Blog
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/login-punto-venta"
                  onClick={handleMenuClick}
                  className="text-base "
                >
                  Punto de Venta
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/politica"
                  onClick={handleMenuClick}
                  className="text-base "
                >
                  Politica de Privacidad
                </NavLink>
              </li>
              <li>
                <p className="text-white text-base">ravekh.team@gmail.com</p>
              </li>
            </ul>
          </nav>
        )}

        <div
          className="drawer-content flex flex-col min-w-full relative hidden"
          id="menuIconoCatalogo"
        >
          <div
            className="w-full min-h-16 rounded-b-lg fixed z-50 flex items-center justify-between px-4"
            style={{ backgroundColor: color }}
          >
            {/* Icono del carrito a la izquierda */}

            <div
              ref={catalogoIconRef}
              className="bg-white w-8 h-8 rounded-full flex items-center justify-center"
              onClick={handleMenuClickCatalogo}
              id="imgCatalogo"
            >
              <img src={menu} alt="menu" className="h-8 w-8" />
            </div>

            <div
              onClick={() => window.history.back()}
              id="backCatalogo"
              className="w-8 h-8 rounded-full flex items-center justify-center transform rotate-180 hidden"
              style={{ backgroundColor: color }}
            >
              <img src={arrow} alt="arrow" className="w-8 h-8 " />
            </div>

            <div>
              <h2 className="text-white text-center text-lg font-semibold">
                {nombre}
              </h2>
            </div>

            <NavLink to={"/catalogo/pedido"}>
              <div className="relative">
                <img src={cart} alt="cart" className="w-8 h-8" />
                {context.cart.length > 0 && (
                  <span
                    className="absolute top-0 right-0 bg-gray-50 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                    style={{ color: color }}
                  >
                    {context.cart.length}
                  </span>
                )}
              </div>
            </NavLink>
          </div>

          <nav
            ref={slideDownRefCatalogo}
            className="menu-container fixed top-0 left-0 w-full h-full z-30"
            style={{ display: "none", backgroundColor: color }}
          >
            <ul
              ref={listItemsRefCatalogo}
              className="list-items flex flex-col items-center justify-center h-full"
            >
              <li>
                <p className="text-white text-base">ravekh.team@gmail.com</p>
              </li>
            </ul>
          </nav>
        </div>

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/proyectos" element={<Muestra />} />
          <Route path="/paquetes" element={<Paquetes />} />
          <Route path="/politica" element={<PoliticaPrivacidad />} />
          <Route path="/RavekhPos" element={<RavekhPos />} />
          <Route path="/blog" element={<BlogMain />} />
          <Route path="/blog/articulosIA" element={<MainArticulosIA />} />
          <Route
            path="/blog/articulosIA/whisper"
            element={<ArticuloWhisper />}
          />
          <Route
            path="/blog/articulosReactNative"
            element={<MainArticulosReactNative />}
          />
          <Route
            path="/blog/articulosReactNative/valeLaPena"
            element={<ArticuloValeLaPenaReact />}
          />
          {/*RUTAS PARA EL CATALOGO WEB */}
          <Route path="/catalogo/:idBusiness" element={<MainCatalogo />} />
          <Route
            path="/catalogo/producto/:idProducto/:telefono"
            element={<DetalleProducto />}
          />
          <Route path="/catalogo/pedido" element={<Pedido />} />
          {/* RUTAS PARA EL PUNTO DE VENTA */}
          <Route path="/login-punto-venta" element={<AuthPage />} />
          <Route path="/MainSales" element={<MainSales />} />
        </Routes>
      </div>
    </div>
  );
};
