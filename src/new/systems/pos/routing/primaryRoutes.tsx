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
import { POS_V2_LEGACY_PATHS, POS_V2_PATHS } from "./PosV2Paths";

const withAuth = (element: JSX.Element) => <PosV2RequireAuth>{element}</PosV2RequireAuth>;

export const POS_V2_PRIMARY_ROUTES = [
  { path: "/pos", element: <PosModeEntryPage /> },
  { path: POS_V2_PATHS.login, element: <PosV2LoginPage /> },
  { path: POS_V2_PATHS.sales, element: withAuth(<PosV2SalesHomePage />) },
  { path: POS_V2_PATHS.products, element: withAuth(<ProductsV2PosPage />) },
  { path: POS_V2_PATHS.finances, element: withAuth(<PosV2FinancePage />) },
  { path: POS_V2_PATHS.reports, element: withAuth(<PosV2ReportingPage />) },
  { path: POS_V2_PATHS.more, element: withAuth(<PosV2MorePage />) },
  { path: POS_V2_PATHS.morePreview(), element: withAuth(<PosV2ModulePreviewPage />) },
  { path: POS_V2_PATHS.customers, element: withAuth(<PosV2CustomersPage />) },
  { path: POS_V2_PATHS.employees, element: withAuth(<PosV2EmployeesPage />) },
  { path: POS_V2_PATHS.tableZones, element: withAuth(<PosV2TableZonesPage />) },
  { path: POS_V2_PATHS.printers, element: withAuth(<PosV2PrintersPage />) },
  { path: POS_V2_PATHS.cashClosing, element: withAuth(<PosV2CashClosingPage />) },
  { path: POS_V2_PATHS.inventory, element: withAuth(<PosV2InventoryPage />) },
  { path: POS_V2_PATHS.loyalty, element: withAuth(<PosV2LoyaltyPage />) },
  { path: POS_V2_PATHS.coupons, element: withAuth(<PosV2LoyaltyPage />) },
  { path: POS_V2_PATHS.visits, element: withAuth(<PosV2LoyaltyPage />) },
  { path: POS_V2_PATHS.catalog, element: withAuth(<PosV2CatalogPage />) },
  { path: POS_V2_PATHS.onlineStore, element: withAuth(<PosV2OnlineOrdersPage />) },
  { path: POS_V2_PATHS.health, element: withAuth(<PosHealthV2Screen />) },
  { path: POS_V2_LEGACY_PATHS.login, element: <Navigate to={POS_V2_PATHS.login} replace /> },
  { path: POS_V2_LEGACY_PATHS.sales, element: <Navigate to={POS_V2_PATHS.sales} replace /> },
  { path: POS_V2_LEGACY_PATHS.products, element: <Navigate to={POS_V2_PATHS.products} replace /> },
  { path: POS_V2_LEGACY_PATHS.finances, element: <Navigate to={POS_V2_PATHS.finances} replace /> },
  { path: POS_V2_LEGACY_PATHS.reports, element: <Navigate to={POS_V2_PATHS.reports} replace /> },
  { path: POS_V2_LEGACY_PATHS.more, element: <Navigate to={POS_V2_PATHS.more} replace /> },
  { path: POS_V2_LEGACY_PATHS.customers, element: <Navigate to={POS_V2_PATHS.customers} replace /> },
  { path: POS_V2_LEGACY_PATHS.employees, element: <Navigate to={POS_V2_PATHS.employees} replace /> },
  { path: POS_V2_LEGACY_PATHS.cashClosing, element: <Navigate to={POS_V2_PATHS.cashClosing} replace /> },
  { path: POS_V2_LEGACY_PATHS.inventory, element: <Navigate to={POS_V2_PATHS.inventory} replace /> },
  { path: POS_V2_LEGACY_PATHS.loyalty, element: <Navigate to={POS_V2_PATHS.loyalty} replace /> },
  { path: POS_V2_LEGACY_PATHS.printers, element: <Navigate to={POS_V2_PATHS.printers} replace /> },
  { path: POS_V2_LEGACY_PATHS.coupons, element: <Navigate to={POS_V2_PATHS.coupons} replace /> },
  { path: POS_V2_LEGACY_PATHS.visits, element: <Navigate to={POS_V2_PATHS.visits} replace /> },
  { path: POS_V2_LEGACY_PATHS.catalog, element: <Navigate to={POS_V2_PATHS.catalog} replace /> },
  { path: POS_V2_LEGACY_PATHS.health, element: <Navigate to={POS_V2_PATHS.health} replace /> },
  { path: POS_V2_LEGACY_PATHS.onlineStore, element: <Navigate to={POS_V2_PATHS.onlineStore} replace /> },
  { path: POS_V2_LEGACY_PATHS.posRoot, element: <Navigate to={POS_V2_PATHS.login} replace /> },
  { path: POS_V2_LEGACY_PATHS.posLoginAlias, element: <Navigate to={POS_V2_PATHS.login} replace /> },
  { path: POS_V2_LEGACY_PATHS.posSalesAlias, element: <Navigate to={POS_V2_PATHS.sales} replace /> },
  { path: POS_V2_LEGACY_PATHS.posProductsAlias, element: <Navigate to={POS_V2_PATHS.products} replace /> },
  { path: POS_V2_LEGACY_PATHS.posFinancesAlias, element: <Navigate to={POS_V2_PATHS.finances} replace /> },
  { path: POS_V2_LEGACY_PATHS.posReportsAlias, element: <Navigate to={POS_V2_PATHS.reports} replace /> },
  { path: POS_V2_LEGACY_PATHS.posMoreAlias, element: <Navigate to={POS_V2_PATHS.more} replace /> },
  { path: POS_V2_LEGACY_PATHS.posTablesAlias, element: <Navigate to={POS_V2_PATHS.tableZones} replace /> },
  { path: POS_V2_LEGACY_PATHS.posPrintersAlias, element: <Navigate to={POS_V2_PATHS.printers} replace /> },
  { path: POS_V2_LEGACY_PATHS.posCouponsAlias, element: <Navigate to={POS_V2_PATHS.coupons} replace /> },
  { path: POS_V2_LEGACY_PATHS.posVisitsAlias, element: <Navigate to={POS_V2_PATHS.visits} replace /> },
  { path: POS_V2_LEGACY_PATHS.posCatalogAlias, element: <Navigate to={POS_V2_PATHS.catalog} replace /> },
  { path: POS_V2_LEGACY_PATHS.posHealthAlias, element: <Navigate to={POS_V2_PATHS.health} replace /> },
  { path: POS_V2_LEGACY_PATHS.posInventoryAlias, element: <Navigate to={POS_V2_PATHS.inventory} replace /> },
  { path: POS_V2_LEGACY_PATHS.posCashClosingAlias, element: <Navigate to={POS_V2_PATHS.cashClosing} replace /> },
  { path: POS_V2_LEGACY_PATHS.posLoyaltyAlias, element: <Navigate to={POS_V2_PATHS.loyalty} replace /> },
  { path: POS_V2_LEGACY_PATHS.posOnlineStoreAlias, element: <Navigate to={POS_V2_PATHS.onlineStore} replace /> },
  { path: "/", element: <LandingPageRavekhPage /> },
];
