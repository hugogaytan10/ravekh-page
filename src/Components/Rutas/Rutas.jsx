
import React, { useRef, useEffect, useContext, useState, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
import { MainCart } from "../CatalogoWeb/PuntoVenta/Sales/Cart/Cart";
import { DiscountScreen } from "../CatalogoWeb/PuntoVenta/Sales/Cart/DiscountScreen";
import { PaymentTypeScreen } from "../CatalogoWeb/PuntoVenta/Sales/Cart/PaymentTypeScreen";
import { PaymentScreen } from "../CatalogoWeb/PuntoVenta/Sales/Cart/PaymentScreen";
import { FinishScreen } from "../CatalogoWeb/PuntoVenta/Sales/Cart/FinishScreen";
import { AddProductSales } from "../CatalogoWeb/PuntoVenta/Sales/CRUDSales/AddProductSales";
import { NavBottom } from "./NavBottom";
import { CategoriasScreenSales } from "../CatalogoWeb/PuntoVenta/Sales/CRUDSales/CategoriasScreenSales";
import { AddCategoriesSales } from "../CatalogoWeb/PuntoVenta/Sales/CRUDSales/AddCategories";
import { MainProducts } from "../CatalogoWeb/PuntoVenta/Products/MainProducts";
import { AddProduct } from "../CatalogoWeb/PuntoVenta/Products/CRUDProducts/AddProduct";
import { MainFinances } from "../CatalogoWeb/PuntoVenta/Finance/MainFinances";
import { SelectCategory } from "../CatalogoWeb/PuntoVenta/Products/Categories/SelectCategory";
import { EditProduct } from "../CatalogoWeb/PuntoVenta/Products/CRUDProducts/EditProduct";
import { EditCategory } from "../CatalogoWeb/PuntoVenta/Products/Categories/EditCaterogy";
import { List } from "../CatalogoWeb/PuntoVenta/Products/CRUDProducts/List";
import { StockProducts } from "../CatalogoWeb/PuntoVenta/Products/Stock/StockProducts";
import { Scanner } from "../CatalogoWeb/PuntoVenta/Sales/NavBar/Scanner";
import { SearchScreen } from "../CatalogoWeb/PuntoVenta/Sales/NavBar/SearchScreen";
import { SearchProductScreen } from "../CatalogoWeb/PuntoVenta/Products/NavBar/SearchProductScreen";
import { QuantityNextSell } from "../CatalogoWeb/PuntoVenta/Sales/NavBar/QuantityNextSell";
import { Filter } from "../CatalogoWeb/PuntoVenta/Products/NavBar/Filter";
import { KeyboardStock } from "../CatalogoWeb/PuntoVenta/Products/Stock/KeyBoardStock";
import { MainReports } from "../CatalogoWeb/PuntoVenta/Reports/MainReports";
import ReportIncome from "../CatalogoWeb/PuntoVenta/Reports/Incomes/ReportIncome";
import ReportSales from "../CatalogoWeb/PuntoVenta/Reports/Sales/ReportSales";
import ReportOrderDetails from "../CatalogoWeb/PuntoVenta/Reports/Sales/ReportOrderDetails";
import ReportCommandDetails from "../CatalogoWeb/PuntoVenta/Reports/Sales/ReportCommandDetails";
import CardIncome from "../CatalogoWeb/PuntoVenta/Reports/Sales/CardIncome";
import CashIncome from "../CatalogoWeb/PuntoVenta/Reports/Sales/CashIncome";
import BestSelling from "../CatalogoWeb/PuntoVenta/Reports/BestSellingProducts/BestSelling";
import BestCategorySelling from "../CatalogoWeb/PuntoVenta/Reports/BestSellingProducts/BestCategorySelling";
import { MainSettings } from "../CatalogoWeb/PuntoVenta/Settings/MainSettings";
import { BoxCutting } from "../CatalogoWeb/PuntoVenta/Settings/BoxCutting/BoxCutting";
import { MainStoreOnline } from "../CatalogoWeb/PuntoVenta/Settings/StoreOnline/MainStoreOnline";
import { OrdersScreen } from "../CatalogoWeb/PuntoVenta/Settings/StoreOnline/Orders";
import { OrderDetailScreen } from "../CatalogoWeb/PuntoVenta/Settings/StoreOnline/OrderDetails";
import { UpdateStoreInfo } from "../CatalogoWeb/PuntoVenta/Settings/StoreOnline/UpdateStoreInfo";
import { CuttingByEmployee } from "../CatalogoWeb/PuntoVenta/Settings/BoxCutting/CuttingByEmployee";
import { ClientSelect } from "../CatalogoWeb/PuntoVenta/Customers/ClientSelect";
import { Client } from "../CatalogoWeb/PuntoVenta/Customers/Client";
import { OrdersByCustomer } from "../CatalogoWeb/PuntoVenta/Customers/OrdersByCustomer";
import { EditClient } from "../CatalogoWeb/PuntoVenta/Customers/EditClient";
import { Employees } from "../CatalogoWeb/PuntoVenta/Employees/Employees";
import { NewEmployee } from "../CatalogoWeb/PuntoVenta/Employees/NewEmployee";
import { Dashboard } from "../CatalogoWeb/PuntoVenta/Dashboard/Dashboard";
export const Rutas = () => {
  const navigate = useNavigate(); // Hook de react-router-dom para navegar entre rutas
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
    if (listItemsRefCatalogo.current && slideDownRefPOS.current) {
      gsap.set(slideDownRefPOS.current, { y: "-90%", display: "block", overflow: "hidden", });

      menuTogglePOS.current = new TimelineMax({
        paused: true,
        reversed: true,
      })
        .to(slideDownRefPOS.current, 1, { y: "0%", ease: "power1.out" })
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
    if (slideDownRef.current && listItemsRef.current) {
      gsap.set(slideDownRef.current, { y: "-100%", display: "block", overflow: "hidden", });

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
      gsap.set(slideDownRefCatalogo.current, { y: "-100%", display: "block", overflow: "hidden", });

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
  }, [location.pathname]);

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
    if (menuToggle.current) {
      menuToggle.current.reversed()
        ? menuToggle.current.restart()
        : menuToggle.current.reverse();
    }
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
    const hiddenRoutes = [
      "/login-punto-venta",
      "/MainSales",
      "/MainCart",
      "/DiscountScreen",
      "/payment-type",
      "/payment",
      "/finish",
      "/add-product",
      "/select-caterory-sales",
      "/add-category-sales",
      "/main-products",
      "/add-product-products",
      "/select-category-product",
      "/edit-product/:productId",
      "/edit-category",
      "/report-income/:period/:businessId",
      "/report-sales/:period/:businessId",
      "/report-order-details/:orderId",
      "/report-command-details/:commandId",
      "/card-income/:period/:businessId",
      "/cash-income/:period/:businessId",
      "/best-selling/:period/:businessId",
      "/best-category-selling/:period/:businessId",
      "/more",
      "/box-cutting",
      "/cutting-by-employee/:employeeId",
      "/main-store-online",
      "/orders",
      "/order-details/:orderId",
      "/update-store-info",
      "/clients",
      "/orders-by-customer/:customerId/:period",
      "/edit-customer/:id",
      "/employees",
      "/new-employee",
      "/client-select",
      "/dashboard",
    ];
    const path = location.pathname.toLowerCase(); // Asegúrate de trabajar con minúsculas
    return !hiddenRoutes.some(route => {
      const decodedPath = decodeURIComponent(location.pathname); // Decodificar ruta
      const routeRegex = new RegExp(
        `^${route.replace(/:\w+/g, "[\\p{L}\\p{N}\\p{M}]+")}$`,
        "iu"
      );
      return routeRegex.test(decodedPath);
    });
  }, [location.pathname]);

  useEffect(() => {
    const protectedRoutes = [
      "/mainsales",
      "/maincart",
      "/discountscreen",
      "/payment-type",
      "/payment",
      "/finish",
      "/add-product",
      "/select-caterory-sales",
      "/add-category-sales",
      "/MainFinances",
      "/main-products",
      "/add-product-products",
      "/select-category-product",
      "/edit-product/:productId",
      "/edit-category",
      "/scanner-sales",
      "/search-product",
      "/search-product-products",
      "/next-quantity-sell",
      "/products-filter",
      "/keyboardProduct/:productId/:currentStock",
      "/main-reports",
      "/report-income/:period/:businessId",
      "/report-sales/:period/:businessId",
      "/report-order-details/:orderId",
      "/report-command-details/:commandId",
      "/card-income/:period/:businessId",
      "/cash-income/:period/:businessId",
      "/best-selling/:period/:businessId",
      "/best-category-selling/:period/:businessId",
      "/more",
      "/box-cutting",
      "/cutting-by-employee/:employeeId",
      "/main-store-online",
      "/orders",
      "/order-details/:orderId",
      "/update-store-info",
      "/clients",
      "/orders-by-customer/:customerId/:period",
      "/edit-customer/:id",
      "/employees",
      "/new-employee",
      "/client-select",
      "/dashboard",
    ];

    const currentPath = location.pathname.toLowerCase().replace(/\/+$/, ""); // Convertir a minúsculas y quitar "/" al final

    if (protectedRoutes.includes(currentPath) && !context.user.Token) {
      navigate("/");
    }
  }, [location, navigate, context.cartPos]);

  return (
    <div className="drawer ">
      <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />

      <div className="  drawer-content flex flex-col h-full min-w-full relative overflow-hidden">
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
                  className="text-base"
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
            className="w-full min-h-16 rounded-b-lg fixed z-40 flex items-center justify-between px-4"
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
            className="menu-container fixed top-0 left-0 w-full h-full z-30 "
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
          <Route path="/MainCart" element={<MainCart />} />
          <Route path="/DiscountScreen" element={<DiscountScreen />} />
          <Route path="/payment-type" element={<PaymentTypeScreen />} />
          <Route path="/payment" element={<PaymentScreen />} />
          <Route path="/finish" element={<FinishScreen />} />
          
          <Route path="/add-product" element={<AddProductSales />} />
          <Route path="/select-caterory-sales" element={<CategoriasScreenSales />} />
          <Route path="/add-category-sales" element={<AddCategoriesSales />} />
          <Route path="/main-products" element={<MainProducts />}>
            <Route path="items" element={<List />} />
            <Route path="stock" element={<StockProducts />} />
          </Route>
          <Route path="/add-product-products" element={<AddProduct />} />
          <Route path="/MainFinances" element={<MainFinances />} />
          <Route path="select-category-product" element={<SelectCategory />} />
          <Route path="/edit-product/:productId" element={<EditProduct />} />
          <Route path="/edit-category" element={<EditCategory />} />
          <Route path="/scanner-sales" element={<Scanner />} />
          <Route path="/search-product" element={<SearchScreen />} />
          <Route path="/search-product-products" element={<SearchProductScreen />} />
          <Route path="/next-quantity-sell" element={<QuantityNextSell />} />
          <Route path="/products-filter" element={<Filter />} />
          <Route path="/keyboardProduct/:productId/:currentStock" element={<KeyboardStock />} />
          <Route path="/main-reports" element={<MainReports />} />
          <Route path="/report-income/:period/:businessId" element={<ReportIncome />} />
          <Route path="/report-sales/:period/:businessId" element={<ReportSales />} />
          <Route path="/report-order-details/:orderId" element={<ReportOrderDetails />} />
          <Route path="/report-command-details/:commandId" element={<ReportCommandDetails />} />
          <Route path="/card-income/:period/:businessId" element={<CardIncome />} />
          <Route path="/cash-income/:period/:businessId" element={<CashIncome />} />
          <Route path="/best-selling/:period/:businessId" element={<BestSelling />} />
          <Route path="/best-category-selling/:period/:businessId" element={<BestCategorySelling />} />
          <Route path="/more" element={<MainSettings />} />  
          <Route path="/box-cutting" element={<BoxCutting />} />  
          <Route path="/cutting-by-employee/:employeeId" element={<CuttingByEmployee />} />  
          <Route path="/main-store-online" element={<MainStoreOnline />} />  
          <Route path="/orders" element={<OrdersScreen />} />  
          <Route path="/order-details/:orderId" element={<OrderDetailScreen />} />  
          <Route path="/update-store-info" element={<UpdateStoreInfo />} />  
          <Route path="/clients" element={<Client />} />  
          <Route path="/orders-by-customer/:customerId/:period" element={<OrdersByCustomer />} />  
          <Route path="/edit-customer/:id" element={<EditClient />} />  
          <Route path="/employees" element={<Employees />} />  
          <Route path="/new-employee" element={<NewEmployee />} />  
          <Route path="/client-select" element={<ClientSelect />} />  
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
      {context.showNavBarBottom && <NavBottom />}
    </div>
  );
};
