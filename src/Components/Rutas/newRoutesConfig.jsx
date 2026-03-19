import React from "react";
import { Navigate } from "react-router-dom";
import { LandingPageRavekhPage } from "../../new/systems/landing-ravekh/pages/LandingRavekhPage";
import { RavekhPos } from "../RavekhPos/RavekhPos";
import { AuthPage } from "../CatalogoWeb/PuntoVenta/Login/AuthPage";
import { MainSales } from "../CatalogoWeb/PuntoVenta/Sales/MainSales";
import { MainProducts } from "../CatalogoWeb/PuntoVenta/Products/MainProducts";
import { List } from "../CatalogoWeb/PuntoVenta/Products/CRUDProducts/List";
import { StockProducts } from "../CatalogoWeb/PuntoVenta/Products/Stock/StockProducts";
import { MainReports } from "../CatalogoWeb/PuntoVenta/Reports/MainReports";
import { MainSettings } from "../CatalogoWeb/PuntoVenta/Settings/MainSettings";
import { Dashboard } from "../CatalogoWeb/PuntoVenta/Dashboard/Dashboard";
import { MainFinances } from "../CatalogoWeb/PuntoVenta/Finance/MainFinances";
import { Client } from "../CatalogoWeb/PuntoVenta/Customers/Client";
import { ClientSelect } from "../CatalogoWeb/PuntoVenta/Customers/ClientSelect";
import { EditClient } from "../CatalogoWeb/PuntoVenta/Customers/EditClient";
import { Employees } from "../CatalogoWeb/PuntoVenta/Employees/Employees";
import { NewEmployee } from "../CatalogoWeb/PuntoVenta/Employees/NewEmployee";
import { EditEmployee } from "../CatalogoWeb/PuntoVenta/Employees/EditEmployee";
import { PosModeEntryPage } from "../../new/systems/pos/routing/PosModeEntryPage";
import { ProductsV2PosPage } from "../../new/systems/pos/features/products/ui/ProductsV2PosPage";
import { PosHealthV2Screen } from "../../new/systems/pos/features/health/ui/PosHealthV2Screen";
import { PosV2LoginPage } from "../../new/systems/pos/features/auth/ui/PosV2LoginPage";
import { PosV2PlaceholderPage } from "../../new/systems/pos/features/shell/ui/PosV2PlaceholderPage";
import { PosV2SalesHomePage } from "../../new/systems/pos/features/sales/ui/PosV2SalesHomePage";
import { PosV2RequireAuth } from "../../new/systems/pos/routing/PosV2RequireAuth";

export const NEW_PRIMARY_ROUTES = [
  { path: "/pos", element: <PosModeEntryPage /> },
  { path: "/v2/login-punto-venta", element: <PosV2LoginPage /> },
  { path: "/v2/MainSales", element: <PosV2RequireAuth><PosV2SalesHomePage /></PosV2RequireAuth> },
  { path: "/v2/main-products/items", element: <PosV2RequireAuth><ProductsV2PosPage /></PosV2RequireAuth> },
  { path: "/v2/MainFinances", element: <PosV2RequireAuth><PosV2PlaceholderPage title="Finanzas" description="Pantalla de finanzas en migración al stack nuevo." /></PosV2RequireAuth> },
  { path: "/v2/dashboard", element: <PosV2RequireAuth><PosV2PlaceholderPage title="Reportes" description="Pantalla de reportes en migración al stack nuevo." /></PosV2RequireAuth> },
  { path: "/v2/more", element: <PosV2RequireAuth><PosV2PlaceholderPage title="Más" description="Configuraciones y accesos adicionales del POS v2." /></PosV2RequireAuth> },
  { path: "/v2/health", element: <PosV2RequireAuth><PosHealthV2Screen /></PosV2RequireAuth> },
  // Compatibilidad temporal de rutas /v2/pos/*
  { path: "/v2/pos", element: <Navigate to="/v2/login-punto-venta" replace /> },
  { path: "/v2/pos/login", element: <Navigate to="/v2/login-punto-venta" replace /> },
  { path: "/v2/pos/sales", element: <Navigate to="/v2/MainSales" replace /> },
  { path: "/v2/pos/products", element: <Navigate to="/v2/main-products/items" replace /> },
  { path: "/v2/pos/finances", element: <Navigate to="/v2/MainFinances" replace /> },
  { path: "/v2/pos/reports", element: <Navigate to="/v2/dashboard" replace /> },
  { path: "/v2/pos/more", element: <Navigate to="/v2/more" replace /> },
  { path: "/v2/pos/health", element: <Navigate to="/v2/health" replace /> },
  { path: "/", element: <LandingPageRavekhPage /> },
  { path: "/RavekhPos", element: <RavekhPos /> },
  { path: "/login-punto-venta", element: <AuthPage /> },
  { path: "/MainSales", element: <MainSales /> },
  {
    path: "/main-products",
    element: <MainProducts />,
    children: [
      { path: "items", element: <List /> },
      { path: "stock", element: <StockProducts /> },
    ],
  },
  { path: "/main-reports", element: <MainReports /> },
  { path: "/more", element: <MainSettings /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/MainFinances", element: <MainFinances /> },
  { path: "/clients", element: <Client /> },
  { path: "/client-select", element: <ClientSelect /> },
  { path: "/edit-customer/:id", element: <EditClient /> },
  { path: "/employees", element: <Employees /> },
  { path: "/new-employee", element: <NewEmployee /> },
  { path: "/edit-employee/:id", element: <EditEmployee /> },
];
