
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
import { PoliticaPrivacidadAgenda } from "../PoliticaPrivacidad/PoliticaPrivacidadAgenda";
//importaciones para el catalogo web
import { RavekhPos } from "../RavekhPos/RavekhPos";

// Importaciones para el punto de venta - Login
import { AuthPage } from "../CatalogoWeb/PuntoVenta/Login/AuthPage";

// Importaciones para el punto de venta - Sales
import { MainSales } from "../CatalogoWeb/PuntoVenta/Sales/MainSales";
import { MainCart } from "../CatalogoWeb/PuntoVenta/Sales/Cart/Cart";
import { DiscountScreen } from "../CatalogoWeb/PuntoVenta/Sales/Cart/DiscountScreen";
import { PaymentTypeScreen } from "../CatalogoWeb/PuntoVenta/Sales/Cart/PaymentTypeScreen";
import { PaymentScreen } from "../CatalogoWeb/PuntoVenta/Sales/Cart/PaymentScreen";
import { FinishScreen } from "../CatalogoWeb/PuntoVenta/Sales/Cart/FinishScreen";
import { AddProductSales } from "../CatalogoWeb/PuntoVenta/Sales/CRUDSales/AddProductSales";
import { CategoriasScreenSales } from "../CatalogoWeb/PuntoVenta/Sales/CRUDSales/CategoriasScreenSales";
import { AddCategoriesSales } from "../CatalogoWeb/PuntoVenta/Sales/CRUDSales/AddCategories";
import { Scanner } from "../CatalogoWeb/PuntoVenta/Sales/NavBar/Scanner";
import { SearchScreen } from "../CatalogoWeb/PuntoVenta/Sales/NavBar/SearchScreen";
import { QuantityNextSell } from "../CatalogoWeb/PuntoVenta/Sales/NavBar/QuantityNextSell";

// Importaciones para el punto de venta - Products
import { MainProducts } from "../CatalogoWeb/PuntoVenta/Products/MainProducts";
import { AddProduct } from "../CatalogoWeb/PuntoVenta/Products/CRUDProducts/AddProduct";
import { SelectCategory } from "../CatalogoWeb/PuntoVenta/Products/Categories/SelectCategory";
import { EditProduct } from "../CatalogoWeb/PuntoVenta/Products/CRUDProducts/EditProduct";
import { EditCategory } from "../CatalogoWeb/PuntoVenta/Products/Categories/EditCaterogy";
import { List } from "../CatalogoWeb/PuntoVenta/Products/CRUDProducts/List";
import { StockProducts } from "../CatalogoWeb/PuntoVenta/Products/Stock/StockProducts";
import { SearchProductScreen } from "../CatalogoWeb/PuntoVenta/Products/NavBar/SearchProductScreen";
import { Filter } from "../CatalogoWeb/PuntoVenta/Products/NavBar/Filter";
import { KeyboardStock } from "../CatalogoWeb/PuntoVenta/Products/Stock/KeyBoardStock";

// Importaciones para el punto de venta - Reports
import { MainReports } from "../CatalogoWeb/PuntoVenta/Reports/MainReports";
import ReportIncome from "../CatalogoWeb/PuntoVenta/Reports/Incomes/ReportIncome";
import ReportSales from "../CatalogoWeb/PuntoVenta/Reports/Sales/ReportSales";
import ReportOrderDetails from "../CatalogoWeb/PuntoVenta/Reports/Sales/ReportOrderDetails";
import ReportCommandDetails from "../CatalogoWeb/PuntoVenta/Reports/Sales/ReportCommandDetails";
import CardIncome from "../CatalogoWeb/PuntoVenta/Reports/Sales/CardIncome";
import CashIncome from "../CatalogoWeb/PuntoVenta/Reports/Sales/CashIncome";
import BestSelling from "../CatalogoWeb/PuntoVenta/Reports/BestSellingProducts/BestSelling";
import BestCategorySelling from "../CatalogoWeb/PuntoVenta/Reports/BestSellingProducts/BestCategorySelling";
import { RavekhAgenda } from "../AgendaT/RavekhAgenda";
// Importaciones para el punto de venta - Settings
// Importaciones para el punto de venta - Settings - principal
import { MainSettings } from "../CatalogoWeb/PuntoVenta/Settings/MainSettings";
// Importaciones para el punto de venta - Settings - BoxCutting
import { BoxCutting } from "../CatalogoWeb/PuntoVenta/Settings/BoxCutting/BoxCutting";
import { CuttingByEmployee } from "../CatalogoWeb/PuntoVenta/Settings/BoxCutting/CuttingByEmployee";
// Importaciones para el punto de venta - Settings - ExportReports
import { ExportReports } from "../CatalogoWeb/PuntoVenta/Settings/ExportReports/ExportReports";
// Importaciones para el punto de venta - Settings - HardwareSettings

// Importaciones para el punto de venta - Settings - Pricing
import { AnimatedSlider } from "../CatalogoWeb/PuntoVenta/Settings/Pricing/pricing";
// Importaciones para el punto de venta - Settings - settings
import { CloseSession } from "../CatalogoWeb/PuntoVenta/Settings/Settings/CloseSession";
import { CustomizeApp } from "../CatalogoWeb/PuntoVenta/Settings/Settings/CustomizeApp";
import { DeleteAccount } from "../CatalogoWeb/PuntoVenta/Settings/Settings/DeleteAccount";
import { GeneralSettings } from "../CatalogoWeb/PuntoVenta/Settings/Settings/GeneralSettings";
import { LanguageSelection } from "../CatalogoWeb/PuntoVenta/Settings/Settings/LanguageSelection";
import { PaymentMethods } from "../CatalogoWeb/PuntoVenta/Settings/Settings/PaymentMethods";
import { SalesTaxSettings } from "../CatalogoWeb/PuntoVenta/Settings/Settings/SalesTaxSettings";
import { SelectMoney } from "../CatalogoWeb/PuntoVenta/Settings/Settings/SelectMoney";
import { SettingsP } from "../CatalogoWeb/PuntoVenta/Settings/Settings/SettingsP";
// Importaciones para el punto de venta - Settings - StoreOnline
import { MainStoreOnline } from "../CatalogoWeb/PuntoVenta/Settings/StoreOnline/MainStoreOnline";
import { OrdersScreen } from "../CatalogoWeb/PuntoVenta/Settings/StoreOnline/Orders";
import { OrderDetailScreen } from "../CatalogoWeb/PuntoVenta/Settings/StoreOnline/OrderDetails";
import { UpdateStoreInfo } from "../CatalogoWeb/PuntoVenta/Settings/StoreOnline/UpdateStoreInfo";
import { AddressStore } from "../CatalogoWeb/PuntoVenta/Settings/StoreOnline/AddressStore";
import { NameStore } from "../CatalogoWeb/PuntoVenta/Settings/StoreOnline/NameStore";
import { PhoneStore } from "../CatalogoWeb/PuntoVenta/Settings/StoreOnline/PhoneStore ";
import { ReferenceStore } from "../CatalogoWeb/PuntoVenta/Settings/StoreOnline/ReferenceStore";
import { StartedStore } from "../CatalogoWeb/PuntoVenta/Settings/StoreOnline/StartedStore";

// Importaciones para el punto de venta - Customers
import { ClientSelect } from "../CatalogoWeb/PuntoVenta/Customers/ClientSelect";
import { Client } from "../CatalogoWeb/PuntoVenta/Customers/Client";
import { OrdersByCustomer } from "../CatalogoWeb/PuntoVenta/Customers/OrdersByCustomer";
import { EditClient } from "../CatalogoWeb/PuntoVenta/Customers/EditClient";

// Importaciones para el punto de venta - Employees
import { Employees } from "../CatalogoWeb/PuntoVenta/Employees/Employees";
import { NewEmployee } from "../CatalogoWeb/PuntoVenta/Employees/NewEmployee";

// Importaciones para el punto de venta - Finance
import { Register } from "../CatalogoWeb/PuntoVenta/Finance/Register/Register";
import { MainFinances } from "../CatalogoWeb/PuntoVenta/Finance/MainFinances";

// Importaciones para el punto de venta - Dashboard
import { Dashboard } from "../CatalogoWeb/PuntoVenta/Dashboard/Dashboard";

// Importaciones generales
import { NavBottom } from "./NavBottom";
//import { deleteAccount } from "../CatalogoWeb/PuntoVenta/Settings/Settings/Petitions";
//import { LanguageSelection } from "../CatalogoWeb/PuntoVenta/Settings/Settings/LanguageSelection";
//import { SalesTaxSettings } from "../CatalogoWeb/PuntoVenta/Settings/Settings/SalesTaxSettings";
import { getCategoriesByBusinesssId } from "../CatalogoWeb/Petitions";
// deeplink para la agenda
import { DeepLinkRedirect } from "../AgendaT/DeepLinkRedict";
import { MainCategoria } from "../CatalogoWeb/Categoria";

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

  //agregados de marco
  const slideRef = useRef(null);
  const [categories, setCategories] = useState([])


  //togle para el catalogo
  const catalogoIconRef = useRef(null);
  const slideDownRefCatalogo = useRef(null);
  const listItemsRefCatalogo = useRef(null);
  const menuToggleCatalogo = useRef(null);
  const [color, setcolor] = useState("");
  const [nombre, setnombre] = useState("");
  const [idBusiness, setidbusiness] = useState("")


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
    const localIdBusiness = localStorage.getItem("idBusiness")
    if (localColor) {
      context.setColor(localColor);
      setcolor(localColor);
    }
    if (localIdBusiness) {
      context.setIdBussiness(localIdBusiness);
      setidbusiness(localIdBusiness)
    }
    if (localNombre) {
      context.setNombre(localNombre);
      setnombre(localNombre);
    }

    // Asegurar que las categorías están cargadas antes de iniciar la animación
    if (categories.length > 0) {
      gsap.set(slideDownRef.current, { y: "-100%", display: "block" });

      menuToggle.current = new TimelineMax({ paused: true, reversed: true })
        .to(menuIconRef.current, 0.5, { x: "30", ease: "back.out(1.7)" })
        .to(slideDownRef.current, 1, { y: "0%", ease: "back.out(1.7)" })
        .staggerFrom(
          listItemsRef.current.children,
          0.25,
          {
            y: "-70px",
            opacity: 1,
            ease: "power1.out",
            onComplete: function () {
              // Al final de la animación, asegurar que todos los elementos son visibles
              gsap.set(listItemsRef.current.children, { opacity: 1, transform: "translate(0px, 0px)" });
            }
          },
          0.1
        );

    }
  }, [categories]); // Solo ejecuta cuando las categorías cambian
  useEffect(() => {    // Llamada a la API para cargar categorías cuando se monta el componente
    const idBusiness = localStorage.getItem("idBusiness");
    // si nuestro contexto tiene algo le damos prioridad sino al localstorage
    if (context.idBussiness != 0) {
      getCategoriesByBusinesssId(context.idBussiness).then((data) => {
        //ordenar categorias por el tamano del texto de la categoria
        data.sort((a, b) => a.Name.length - b.Name.length);
        setCategories(data);
      });
    } else {
      getCategoriesByBusinesssId(idBusiness).then((data) => {
        //ordenar categorias por el tamano del texto de la categoria
        data.sort((a, b) => a.Name.length - b.Name.length);
        setCategories(data);
      });
    }
  }, [context.idBussiness]); // Se ejecuta una vez al montar el componente


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
      "/address-store",
      "/name-store",
      "/phone-store",
      "/reference-store",
      "/started-store",
      "/clients",
      "/orders-by-customer/:customerId/:period",
      "/edit-customer/:id",
      "/employees",
      "/new-employee",
      "/client-select",
      "/dashboard",
      "/AddRegister",
      "/delete-account",
      "/settings-p",
      "/customize-app",
      "/select-money",
      "/close-session",
      "/sales-tax-settings",
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
      "/DiscountScreen",
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
      "/main-products/items",
      "/main-products/stock",
      "/edit-category",
      "/scanner-sales",
      "/search-product",
      "/search-product-products",
      "/next-quantity-sell",
      "/products-filter",
      "/keyboardProduct/:productId/:currentStock",
      "/main-reports",
      "/sales-tax-settings",
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
      "/pricing",
      "/close-session",
      "/customize-app",
      "/delete-account",
      "/general-settings",
      "/language-selection",
      "/payment-methods",
      "/select-money",
      "/settings-p",
      "/main-store-online",
      "/orders",
      "/order-details/:orderId",
      "/update-store-info",
      "/address-store",
      "/name-store",
      "/phone-store",
      "/reference-store",
      "/register",
      "/dashboard",
      "/settings-p",
      "/employees/:id",
      "/mainfinances"
    ];

    const currentPath = location.pathname.toLowerCase().replace(/\/+$/, "");

    // Validar rutas dinámicas con parámetros
    if (
      protectedRoutes.some(route =>
        currentPath.startsWith(route.replace(/:\w+/g, ""))
      ) &&
      !context.user.Token
    ) {
      context.setShowNavBarBottom(false);
      navigate("/");
    }
  }, [location, navigate, context.cartPos]);
  /*
    useEffect(() => {
      let timeout;
  
      const resetTimer = () => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
          context.setUser(null); // Remueve el usuario del contexto
          navigate("/login-punto-venta"); // Redirige a login
        }, 30 * 60 * 1000); // 30 minutos de inactividad
      };
  
      // Eventos que resetean el temporizador
      window.addEventListener("mousemove", resetTimer);
      window.addEventListener("keydown", resetTimer);
      window.addEventListener("click", resetTimer);
  
      resetTimer(); // Iniciar el temporizador al montar el componente
  
      return () => {
        if (timeout) clearTimeout(timeout);
        window.removeEventListener("mousemove", resetTimer);
        window.removeEventListener("keydown", resetTimer);
        window.removeEventListener("click", resetTimer);
      };
    }, [navigate, context]);
  */
  const showCategoryList = location.pathname === "/" ||
    location.pathname.startsWith("/catalogo/") ||
    location.pathname.startsWith("/categoria/");
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

        <div className="drawer-content flex flex-col min-w-full relative hidden" id="menuIconoCatalogo">
          {/* Contenedor del encabezado del catálogo */}
          <div
            className="w-full min-h-16 rounded-b-lg fixed z-40 flex flex-col px-4"
            style={{ backgroundColor: color }}
          >
            {/* Primera fila: menú, flecha, título, carrito */}
            <div className="w-full flex items-center justify-between mt-5">
              {/* Icono del menú */}
              <div
                ref={catalogoIconRef}
                className="bg-white w-8 h-8 rounded-full flex items-center justify-center"
                onClick={handleMenuClickCatalogo}
                id="imgCatalogo"
              >
                <img src={menu} alt="menu" className="h-8 w-8" />
              </div>

              {/* Botón de regreso */}
              <div
                onClick={() => window.history.back()}
                id="backCatalogo"
                className="w-8 h-8 rounded-full flex items-center justify-center transform rotate-180 hidden"
                style={{ backgroundColor: color }}
              >
                <img src={arrow} alt="arrow" className="w-8 h-8 " />
              </div>

              {/* Nombre del catálogo */}
              <div>
                <h2
                  className="text-center text-lg font-semibold"
                  style={{ color: idBusiness === "115" ? "#000000" : "#ffffff" }}
                >
                  {nombre}
                </h2>
              </div>

              {/* Ícono del carrito */}
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

            {/* Segunda fila: lista de categorías (justo debajo del carrito) */}
            {showCategoryList && (
              <div
                className="w-full mt-2 overflow-x-auto whitespace-nowrap scrollbar-hide mb-2"
                ref={slideRef}
              >
                <div className="flex flex-nowrap gap-2 px-4">
                  {categories.map((category) => (
                    <button
                      key={category.Id}
                      className={`px-4 py-2 ${
            idBusiness === "115"
              ? " text-black"
              : " text-white"
          } rounded-lg shadow-sm transition duration-300 hover:bg-purple-600`}
                    >
                      <NavLink to={`/categoria/${category.Id}`} className="whitespace-nowrap">
                        {category.Name}
                      </NavLink>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>





          {/* Menú desplegable del catálogo */}
          <nav
            ref={slideDownRefCatalogo}
            className="menu-container fixed top-0 left-0 w-full h-full z-30"
            style={{ display: "none", backgroundColor: color }}
          >
            <ul ref={listItemsRefCatalogo} className="list-items flex flex-col items-center justify-center h-full">
              <li>
                <p className="text-white text-base">ravekh.team@gmail.com</p>
              </li>
            </ul>
          </nav>


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
          <Route path="/politicaAgenda" element={<PoliticaPrivacidadAgenda />} />
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
          <Route path="/categoria/:idCategoria" element={<MainCategoria />} />
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
          <Route path="/pricing" element={<AnimatedSlider />} />
          <Route path="/close-session" element={<CloseSession />} />
          <Route path="/customize-app" element={<CustomizeApp />} />
          <Route path="/delete-account" element={<DeleteAccount />} />
          <Route path="/general-settings" element={<GeneralSettings />} />
          <Route path="/language-selection" element={<LanguageSelection />} />
          <Route path="/payment-methods" element={<PaymentMethods />} />
          <Route path="/sales-tax-settings" element={<SalesTaxSettings />} />
          <Route path="/select-money" element={<SelectMoney />} />
          <Route path="/settings-p" element={<SettingsP />} />
          <Route path="/main-store-online" element={<MainStoreOnline />} />
          <Route path="/orders" element={<OrdersScreen />} />
          <Route path="/order-details/:orderId" element={<OrderDetailScreen />} />
          <Route path="/update-store-info" element={<UpdateStoreInfo />} />
          <Route path="/address-store" element={<AddressStore />} />
          <Route path="/name-store" element={<NameStore />} />
          <Route path="/phone-store" element={<PhoneStore />} />
          <Route path="/reference-store" element={<ReferenceStore />} />
          <Route path="/started-store" element={<StartedStore />} />
          <Route path="/clients" element={<Client />} />
          <Route path="/orders-by-customer/:customerId/:period" element={<OrdersByCustomer />} />
          <Route path="/edit-customer/:id" element={<EditClient />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/new-employee" element={<NewEmployee />} />
          <Route path="/client-select" element={<ClientSelect />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/AddRegister" element={<Register />} />
          <Route path="/RavekhAgenda" element={<RavekhAgenda />} />

          <Route path="/open" element={<DeepLinkRedirect />} />
          <Route path="/open/servicebybusiness/:business" element={<DeepLinkRedirect />} />

        </Routes>
      </div>
      {context.showNavBarBottom && <NavBottom />}
    </div>
  );
};
