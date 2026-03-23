import { Navigate, Route } from "react-router-dom";
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
import { PosV2RequireAuth } from "./PosV2RequireAuth";

export const POS_V2_ROUTES = (
  <>
    <Route path="/v2/login-punto-venta" element={<PosV2LoginPage />} />
    <Route path="/v2/MainSales" element={<PosV2RequireAuth><PosV2SalesHomePage /></PosV2RequireAuth>} />
    <Route path="/v2/main-products/items" element={<PosV2RequireAuth><ProductsV2PosPage /></PosV2RequireAuth>} />
    <Route path="/v2/MainFinances" element={<PosV2RequireAuth><PosV2FinancePage /></PosV2RequireAuth>} />
    <Route path="/v2/dashboard" element={<PosV2RequireAuth><PosV2ReportingPage /></PosV2RequireAuth>} />
    <Route path="/v2/more" element={<PosV2RequireAuth><PosV2MorePage /></PosV2RequireAuth>} />
    <Route path="/v2/more/preview/:moduleId" element={<PosV2RequireAuth><PosV2ModulePreviewPage /></PosV2RequireAuth>} />
    <Route path="/v2/settings/table-zones" element={<PosV2RequireAuth><PosV2TableZonesPage /></PosV2RequireAuth>} />
    <Route path="/v2/customers" element={<PosV2RequireAuth><PosV2CustomersPage /></PosV2RequireAuth>} />
    <Route path="/v2/employees" element={<PosV2RequireAuth><PosV2EmployeesPage /></PosV2RequireAuth>} />
    <Route path="/v2/online-store" element={<PosV2RequireAuth><PosV2OnlineOrdersPage /></PosV2RequireAuth>} />
    <Route path="/v2/health" element={<PosV2RequireAuth><PosHealthV2Screen /></PosV2RequireAuth>} />
    <Route path="/v2/pos" element={<Navigate to="/v2/login-punto-venta" replace />} />
    <Route path="/v2/pos/login" element={<Navigate to="/v2/login-punto-venta" replace />} />
    <Route path="/v2/pos/sales" element={<Navigate to="/v2/MainSales" replace />} />
    <Route path="/v2/pos/products" element={<Navigate to="/v2/main-products/items" replace />} />
    <Route path="/v2/pos/finances" element={<Navigate to="/v2/MainFinances" replace />} />
    <Route path="/v2/pos/reports" element={<Navigate to="/v2/dashboard" replace />} />
    <Route path="/v2/pos/more" element={<Navigate to="/v2/more" replace />} />
    <Route path="/v2/pos/tables" element={<Navigate to="/v2/settings/table-zones" replace />} />
    <Route path="/v2/pos/health" element={<Navigate to="/v2/health" replace />} />
  </>
);
