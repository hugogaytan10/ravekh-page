import { Route } from "react-router-dom";
import { ProductsV2PosPage } from "../features/products/ui/ProductsV2PosPage";
import { PosHealthV2Screen } from "../features/health/ui/PosHealthV2Screen";
import { PosV2LoginPage } from "../features/auth/ui/PosV2LoginPage";
import { PosV2FinancePage } from "../features/finance/ui/PosV2FinancePage";
import { PosV2SalesHomePage } from "../features/sales/ui/PosV2SalesHomePage";
import { PosV2ReportingPage } from "../features/reporting/ui/PosV2ReportingPage";
import { PosV2MorePage } from "../features/more/ui/PosV2MorePage";
import { PosV2ModulePreviewPage } from "../features/more/ui/PosV2ModulePreviewPage";
import { PosV2TableZonesPage } from "../features/settings/table-zones/ui/PosV2TableZonesPage";
import { PosV2CustomersPage } from "../features/customers/ui/PosV2CustomersPage";
import { PosV2EmployeesPage } from "../features/employees/ui/PosV2EmployeesPage";
import { PosV2OnlineOrdersPage } from "../features/online-orders/ui/PosV2OnlineOrdersPage";
import { PosV2CashClosingPage } from "../features/cash-closing/ui/PosV2CashClosingPage";
import { PosV2InventoryPage } from "../features/inventory/ui/PosV2InventoryPage";
import { PosV2RequireAuth } from "./PosV2RequireAuth";
import { POS_V2_PATHS } from "./PosV2Paths";

const withAuth = (element: JSX.Element) => <PosV2RequireAuth>{element}</PosV2RequireAuth>;

export const POS_V2_APP_ROUTES = (
  <>
    <Route path={POS_V2_PATHS.login} element={<PosV2LoginPage />} />
    <Route path={POS_V2_PATHS.sales} element={withAuth(<PosV2SalesHomePage />)} />
    <Route path={POS_V2_PATHS.products} element={withAuth(<ProductsV2PosPage />)} />
    <Route path={POS_V2_PATHS.finances} element={withAuth(<PosV2FinancePage />)} />
    <Route path={POS_V2_PATHS.reports} element={withAuth(<PosV2ReportingPage />)} />
    <Route path={POS_V2_PATHS.more} element={withAuth(<PosV2MorePage />)} />
    <Route path={POS_V2_PATHS.morePreview()} element={withAuth(<PosV2ModulePreviewPage />)} />
    <Route path={POS_V2_PATHS.tableZones} element={withAuth(<PosV2TableZonesPage />)} />
    <Route path={POS_V2_PATHS.cashClosing} element={withAuth(<PosV2CashClosingPage />)} />
    <Route path={POS_V2_PATHS.inventory} element={withAuth(<PosV2InventoryPage />)} />
    <Route path={POS_V2_PATHS.customers} element={withAuth(<PosV2CustomersPage />)} />
    <Route path={POS_V2_PATHS.employees} element={withAuth(<PosV2EmployeesPage />)} />
    <Route path={POS_V2_PATHS.onlineStore} element={withAuth(<PosV2OnlineOrdersPage />)} />
    <Route path={POS_V2_PATHS.health} element={withAuth(<PosHealthV2Screen />)} />
  </>
);
