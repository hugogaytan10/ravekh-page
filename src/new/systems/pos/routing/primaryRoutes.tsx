import React from "react";
import { Navigate } from "react-router-dom";
import { LandingPageRavekhPage } from "../../landing-ravekh/pages/LandingRavekhPage";
import { PosModeEntryPage } from "./PosModeEntryPage";
import { ProductsV2PosPage } from "../features/products/ui/ProductsV2PosPage";
import { PosHealthV2Screen } from "../features/health/ui/PosHealthV2Screen";
import { PosV2LoginPage } from "../features/auth/ui/PosV2LoginPage";
import { PosV2SalesHomePage } from "../features/sales/ui/PosV2SalesHomePage";
import { PosV2FinancePage } from "../features/finance/ui/PosV2FinancePage";
import { PosV2ReportingPage } from "../features/reporting/ui/PosV2ReportingPage";
import { PosV2MorePage } from "../features/more/ui/PosV2MorePage";
import { PosV2ModulePreviewPage } from "../features/more/ui/PosV2ModulePreviewPage";
import { PosV2CustomersPage } from "../features/customers/ui/PosV2CustomersPage";
import { PosV2EmployeesPage } from "../features/employees/ui/PosV2EmployeesPage";
import { PosV2TableZonesPage } from "../features/settings/table-zones/ui/PosV2TableZonesPage";
import { PosV2PrintersPage } from "../features/settings/printers/ui/PosV2PrintersPage";
import { PosV2OnlineOrdersPage } from "../features/online-orders/ui/PosV2OnlineOrdersPage";
import { PosV2CashClosingPage } from "../features/cash-closing/ui/PosV2CashClosingPage";
import { PosV2InventoryPage } from "../features/inventory/ui/PosV2InventoryPage";
import { PosV2LoyaltyPage } from "../features/loyalty/ui/PosV2LoyaltyPage";
import { PosV2CatalogPage } from "../features/catalog/ui/PosV2CatalogPage";
import { PosV2RequireAuth } from "./PosV2RequireAuth";

export const POS_V2_PRIMARY_ROUTES = [
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
  { path: "/v2/settings/printers", element: <PosV2RequireAuth><PosV2PrintersPage /></PosV2RequireAuth> },
  { path: "/v2/cash-closing", element: <PosV2RequireAuth><PosV2CashClosingPage /></PosV2RequireAuth> },
  { path: "/v2/inventory", element: <PosV2RequireAuth><PosV2InventoryPage /></PosV2RequireAuth> },
  { path: "/v2/loyalty", element: <PosV2RequireAuth><PosV2LoyaltyPage /></PosV2RequireAuth> },
  { path: "/v2/coupons", element: <PosV2RequireAuth><PosV2LoyaltyPage /></PosV2RequireAuth> },
  { path: "/v2/visits", element: <PosV2RequireAuth><PosV2LoyaltyPage /></PosV2RequireAuth> },
  { path: "/v2/catalog", element: <PosV2RequireAuth><PosV2CatalogPage /></PosV2RequireAuth> },
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
  { path: "/v2/pos/printers", element: <Navigate to="/v2/settings/printers" replace /> },
  { path: "/v2/pos/coupons", element: <Navigate to="/v2/coupons" replace /> },
  { path: "/v2/pos/visits", element: <Navigate to="/v2/visits" replace /> },
  { path: "/v2/pos/catalog", element: <Navigate to="/v2/catalog" replace /> },
  { path: "/v2/pos/health", element: <Navigate to="/v2/health" replace /> },
  { path: "/v2/pos/online-store", element: <Navigate to="/v2/online-store" replace /> },
  { path: "/", element: <LandingPageRavekhPage /> },
];
