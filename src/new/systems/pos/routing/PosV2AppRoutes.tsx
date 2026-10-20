import {lazy, Suspense} from "react";
import { PosV2SettingsPage } from "../features/settings/ui/PosV2SettingsPage";
import { PosV2AccountPage } from "../features/settings/ui/PosV2AccountPage";
import { PosV2DeleteAccountPage } from "../features/settings/ui/PosV2DeleteAccountPage";
import { PosV2TicketSettingsPage } from "../features/settings/ui/PosV2TicketSettingsPage";
import { PosV2CurrencyPage } from "../features/settings/ui/PosV2CurrencyPage";
import { Route } from "react-router-dom";
import { PosHealthV2Screen } from "../features/health/ui/PosHealthV2Screen";
import { PosV2LoginPage } from "../features/auth/ui/PosV2LoginPage";
import { PosV2PasswordRecoveryPage } from "../features/auth/ui/PosV2PasswordRecoveryPage";
import { PosV2SalesHomePage } from "../features/sales/ui/PosV2SalesHomePage";
import { PosV2MorePage } from "../features/more/ui/PosV2MorePage";
import { PosV2ModulePreviewPage } from "../features/more/ui/PosV2ModulePreviewPage";
import { PosV2TableZonesPage } from "../features/settings/table-zones/ui/PosV2TableZonesPage";
import { PosV2BranchesPage } from "../features/settings/branches/PosV2BranchesPage";
import { PosV2PrintersPage } from "../features/settings/printers/ui/PosV2PrintersPage";
import { PosV2SecurityQuestionsPage } from "../features/settings/security-questions/ui/PosV2SecurityQuestionsPage";
import { PosV2CustomersPage } from "../features/customers/ui/PosV2CustomersPage";
import { PosV2PendingPaymentsPage } from "../features/pending-payments/ui/PosV2PendingPaymentsPage";
import { PosV2EmployeesPage } from "../features/employees/ui/PosV2EmployeesPage";
import { PosV2CashClosingPage } from "../features/cash-closing/ui/PosV2CashClosingPage";
import { PosV2UpgradePlanPage } from "../features/upgrade-plan/ui/PosV2UpgradePlanPage";
import { PosV2RequireAuth } from "./PosV2RequireAuth";
import { POS_V2_PATHS } from "./PosV2Paths";
import { PosV2FeatureRouteGuard } from "./PosV2FeatureRouteGuard";

const PosV2IntelligencePage = lazy(() => import("../features/intelligence/ui/PosV2IntelligencePage").then(module => ({default: module.PosV2IntelligencePage})));
const ProductsV2PosPage = lazy(() => import("../features/products/ui/ProductsV2PosPage").then(module => ({default: module.ProductsV2PosPage})));
const DiscontinuedProductsV2PosPage = lazy(() => import("../features/products/ui/DiscontinuedProductsV2PosPage").then(module => ({default: module.DiscontinuedProductsV2PosPage})));
const PosV2FinancePage = lazy(() => import("../features/finance/ui/PosV2FinancePage").then(module => ({default: module.PosV2FinancePage})));
const PosV2OnlineOrdersPage = lazy(() => import("../features/online-orders/ui/PosV2OnlineOrdersPage").then(module => ({default: module.PosV2OnlineOrdersPage})));
const PosV2InventoryPage = lazy(() => import("../features/inventory/ui/PosV2InventoryPage").then(module => ({default: module.PosV2InventoryPage})));
const PosV2CatalogPage = lazy(() => import("../features/catalog/ui/PosV2CatalogPage").then(module => ({default: module.PosV2CatalogPage})));
const FacturaElectronicaPage = lazy(() => import("../features/factura-electronica/ui/FacturaElectronicaPage").then(module => ({default: module.FacturaElectronicaPage})));

const PosV2ReportingPage = lazy(() => import("../features/reporting/ui/PosV2ReportingPage").then(module => ({default: module.PosV2ReportingPage})));
const PosV2LoyaltyPage = lazy(() => import("../features/loyalty/ui/PosV2LoyaltyPage").then(module => ({default: module.PosV2LoyaltyPage})));
const PosV2CrmPage = lazy(() => import("../features/crm/ui/PosV2CrmPage").then(module => ({default: module.PosV2CrmPage})));

const withAuth = (element: JSX.Element) => (
  <PosV2RequireAuth>
    <Suspense fallback={<p role="status">Cargando…</p>}>{element}</Suspense>
  </PosV2RequireAuth>
);

export const POS_V2_APP_ROUTES = (
  <>
    <Route path={POS_V2_PATHS.login} element={<PosV2LoginPage />} />
    <Route path={POS_V2_PATHS.passwordRecovery} element={<PosV2PasswordRecoveryPage />} />
    <Route path={POS_V2_PATHS.sales} element={withAuth(<PosV2FeatureRouteGuard feature="pos"><PosV2SalesHomePage /></PosV2FeatureRouteGuard>)} />
    <Route path={POS_V2_PATHS.products} element={withAuth(<ProductsV2PosPage />)} />
    <Route path={POS_V2_PATHS.discontinuedProducts} element={withAuth(<DiscontinuedProductsV2PosPage />)} />
    <Route path={POS_V2_PATHS.finances} element={withAuth(<PosV2FinancePage />)} />
    <Route path={POS_V2_PATHS.reports} element={withAuth(<PosV2ReportingPage />)} />
    <Route path={POS_V2_PATHS.settings} element={withAuth(<PosV2SettingsPage />)} />
    <Route path={POS_V2_PATHS.account} element={withAuth(<PosV2AccountPage />)} />
    <Route path={POS_V2_PATHS.deleteAccount} element={withAuth(<PosV2DeleteAccountPage />)} />
    <Route path={POS_V2_PATHS.ticketSettings} element={withAuth(<PosV2TicketSettingsPage />)} />
    <Route path={POS_V2_PATHS.currency} element={withAuth(<PosV2CurrencyPage />)} />
    <Route path={POS_V2_PATHS.intelligence} element={withAuth(<PosV2IntelligencePage />)} />
    <Route path={POS_V2_PATHS.more} element={withAuth(<PosV2MorePage />)} />
    <Route path={POS_V2_PATHS.morePreview()} element={withAuth(<PosV2ModulePreviewPage />)} />
    <Route path={POS_V2_PATHS.facturaElectronica} element={withAuth(<FacturaElectronicaPage />)} />
    <Route path={POS_V2_PATHS.tableZones} element={withAuth(<PosV2TableZonesPage />)} />
    <Route path={POS_V2_PATHS.branches} element={withAuth(<PosV2BranchesPage />)} />
    <Route path={POS_V2_PATHS.printers} element={withAuth(<PosV2PrintersPage />)} />
    <Route path={POS_V2_PATHS.securityQuestions} element={withAuth(<PosV2SecurityQuestionsPage />)} />
    <Route path={POS_V2_PATHS.cashClosing} element={withAuth(<PosV2CashClosingPage />)} />
    <Route path={POS_V2_PATHS.inventory} element={withAuth(<PosV2InventoryPage />)} />
    <Route path={POS_V2_PATHS.loyalty} element={withAuth(<PosV2LoyaltyPage />)} />
    <Route path={POS_V2_PATHS.customers} element={withAuth(<PosV2CustomersPage />)} />
    <Route path={POS_V2_PATHS.crm} element={withAuth(<PosV2CrmPage />)} />
    <Route path={POS_V2_PATHS.pendingPayments} element={withAuth(<PosV2PendingPaymentsPage />)} />
    <Route path={POS_V2_PATHS.employees} element={withAuth(<PosV2EmployeesPage />)} />
    <Route path={POS_V2_PATHS.onlineStore} element={withAuth(<PosV2FeatureRouteGuard feature="catalog"><PosV2OnlineOrdersPage /></PosV2FeatureRouteGuard>)} />
    <Route path={POS_V2_PATHS.coupons} element={withAuth(<PosV2LoyaltyPage />)} />
    <Route path={POS_V2_PATHS.visits} element={withAuth(<PosV2LoyaltyPage />)} />
    <Route path={POS_V2_PATHS.catalog} element={withAuth(<PosV2FeatureRouteGuard feature="catalog"><PosV2CatalogPage /></PosV2FeatureRouteGuard>)} />
    <Route path={POS_V2_PATHS.health} element={withAuth(<PosHealthV2Screen />)} />
    <Route path={POS_V2_PATHS.upgradePlan} element={withAuth(<PosV2UpgradePlanPage />)} />
  </>
);
