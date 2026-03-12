import { RavekhPos } from "../../../Components/RavekhPos/RavekhPos";
import { AuthPage } from "../../../Components/CatalogoWeb/PuntoVenta/Login/AuthPage";
import { InitialCustomizeApp } from "../../../Components/CatalogoWeb/PuntoVenta/Login/CustomizeApp";
import { MainSales } from "../../../Components/CatalogoWeb/PuntoVenta/Sales/MainSales";
import { MainCart } from "../../../Components/CatalogoWeb/PuntoVenta/Sales/Cart/Cart";

export const posFeatureRoutes = [
  { path: "/RavekhPos", element: <RavekhPos /> },
  { path: "/login-punto-venta", element: <AuthPage /> },
  { path: "/create-store", element: <InitialCustomizeApp /> },
  { path: "/MainSales", element: <MainSales /> },
  { path: "/MainCart", element: <MainCart /> },
];
