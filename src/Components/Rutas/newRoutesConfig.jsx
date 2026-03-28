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
import { PosV2SalesHomePage } from "../../new/systems/pos/features/sales/ui/PosV2SalesHomePage";
import { PosV2FinancePage } from "../../new/systems/pos/features/finance/ui/PosV2FinancePage";
import { PosV2ReportingPage } from "../../new/systems/pos/features/reporting/ui/PosV2ReportingPage";
import { PosV2MorePage } from "../../new/systems/pos/features/more/ui/PosV2MorePage";
import { PosV2ModulePreviewPage } from "../../new/systems/pos/features/more/ui/PosV2ModulePreviewPage";
import { PosV2CustomersPage } from "../../new/systems/pos/features/customers/ui/PosV2CustomersPage";
import { PosV2EmployeesPage } from "../../new/systems/pos/features/employees/ui/PosV2EmployeesPage";
import { PosV2TableZonesPage } from "../../new/systems/pos/features/settings/table-zones/ui/PosV2TableZonesPage";
import { PosV2OnlineOrdersPage } from "../../new/systems/pos/features/online-orders/ui/PosV2OnlineOrdersPage";
import { PosV2CashClosingPage } from "../../new/systems/pos/features/cash-closing/ui/PosV2CashClosingPage";
import { PosV2InventoryPage } from "../../new/systems/pos/features/inventory/ui/PosV2InventoryPage";
import { PosV2LoyaltyPage } from "../../new/systems/pos/features/loyalty/ui/PosV2LoyaltyPage";
import { PosV2RequireAuth } from "../../new/systems/pos/routing/PosV2RequireAuth";

export const NEW_PRIMARY_ROUTES = [
  { path: "/pos", element: <PosModeEntryPage /> },
  { path: "/v2/login-punto-venta", element: <PosV2LoginPage /> },
  { path: "/v2/MainSales", element: <PosV2RequireAuth><PosV2SalesHomePage /></PosV2RequireAuth> },
  { path: "/v2/main-products/items", element: <PosV2RequireAuth><ProductsV2PosPage /></PosV2RequireAuth> },
  { path: "/v2/MainFinances", element: <PosV2RequireAuth><PosV2FinancePage /></PosV2RequireAuth> },
  { path: "/v2/dashboard", element: <PosV2RequireAuth><PosV2ReportingPage /></PosV2RequireAuth> },
  { path: "/v2/more", element: <PosV2RequireAuth><PosV2MorePage /></PosV2RequireAuth> },
  { path: "/v2/more/preview/:moduleId", element: <PosV2RequireAuth><PosV2ModulePreviewPage /></PosV2RequireAuth> },
  { path: "/v2/customers", element: <PosV2RequireAuth><PosV2CustomersPage /></PosV2RequireAuth> },
  { path: "/v2/employees", element: <PosV2RequireAuth><PosV2EmployeesPage /></PosV2RequireAuth> },
  { path: "/v2/settings/table-zones", element: <PosV2RequireAuth><PosV2TableZonesPage /></PosV2RequireAuth> },
  { path: "/v2/cash-closing", element: <PosV2RequireAuth><PosV2CashClosingPage /></PosV2RequireAuth> },
  { path: "/v2/inventory", element: <PosV2RequireAuth><PosV2InventoryPage /></PosV2RequireAuth> },
  { path: "/v2/loyalty", element: <PosV2RequireAuth><PosV2LoyaltyPage /></PosV2RequireAuth> },
  { path: "/v2/online-store", element: <PosV2RequireAuth><PosV2OnlineOrdersPage /></PosV2RequireAuth> },
  { path: "/v2/health", element: <PosV2RequireAuth><PosHealthV2Screen /></PosV2RequireAuth> },
  // Compatibilidad temporal de rutas /v2/pos/*
  { path: "/v2/pos", element: <Navigate to="/v2/login-punto-venta" replace /> },
  { path: "/v2/pos/login", element: <Navigate to="/v2/login-punto-venta" replace /> },
  { path: "/v2/pos/sales", element: <Navigate to="/v2/MainSales" replace /> },
  { path: "/v2/pos/products", element: <Navigate to="/v2/main-products/items" replace /> },
  { path: "/v2/pos/finances", element: <Navigate to="/v2/MainFinances" replace /> },
  { path: "/v2/pos/reports", element: <Navigate to="/v2/dashboard" replace /> },
  { path: "/v2/pos/more", element: <Navigate to="/v2/more" replace /> },
  { path: "/v2/pos/customers", element: <Navigate to="/v2/customers" replace /> },
  { path: "/v2/pos/employees", element: <Navigate to="/v2/employees" replace /> },
  { path: "/v2/pos/cash-closing", element: <Navigate to="/v2/cash-closing" replace /> },
  { path: "/v2/pos/inventory", element: <Navigate to="/v2/inventory" replace /> },
  { path: "/v2/pos/loyalty", element: <Navigate to="/v2/loyalty" replace /> },
  { path: "/v2/pos/health", element: <Navigate to="/v2/health" replace /> },
  { path: "/v2/pos/online-store", element: <Navigate to="/v2/online-store" replace /> },
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
