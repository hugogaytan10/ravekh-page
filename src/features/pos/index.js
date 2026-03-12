export { posFeatureRoutes } from "./page/PosFeatureRoutes";
export { posRoutesModel } from "./model/posRoutes";
export { posRouteKeys } from "./model/posRoutes";
export { getPosRoute } from "./service/getPosRoute";
export { buildPosFeatureRoutes } from "./service/buildPosFeatureRoutes";
export { PosAuthPage } from "./page/PosAuthPage";
export { loginToServer, signUpToServer } from "./service/posAuthService";

export {
  posSalesFeatureRoutes,
  posSalesRoutesModel,
  posSalesRouteKeys,
  getPosSalesRoute,
  buildPosSalesFeatureRoutes,
  usePosSalesFeatureRoutes,
  PosSalesPage,
  PosCartPage,
  PosDiscountScreenPage,
  PosPaymentTypeScreenPage,
  PosPaymentScreenPage,
  PosFinishScreenPage,
  PosAddProductSalesPage,
  PosCategoriasScreenSalesPage,
  PosAddCategoriesSalesPage,
  PosScannerSalesPage,
  PosSearchScreenSalesPage,
  PosQuantityNextSellPage,
} from "./sales";

export {
  posProductsFeatureRoutes,
  posProductsRoutesModel,
  posProductsRouteKeys,
  getPosProductsRoute,
  buildPosProductsFeatureRoutes,
} from "./products";

export {
  posFinanceFeatureRoutes,
  posFinanceRoutesModel,
  posFinanceRouteKeys,
  getPosFinanceRoute,
  buildPosFinanceFeatureRoutes,
} from "./finance";

export {
  posReportsFeatureRoutes,
  posReportsRoutesModel,
  posReportsRouteKeys,
  getPosReportsRoute,
  buildPosReportsFeatureRoutes,
} from "./reports";

export {
  posSettingsFeatureRoutes,
  posSettingsRoutesModel,
  posSettingsRouteKeys,
  getPosSettingsRoute,
  buildPosSettingsFeatureRoutes,
} from "./settings";

export {
  posCustomersFeatureRoutes,
  posCustomersRoutesModel,
  posCustomersRouteKeys,
  getPosCustomersRoute,
  buildPosCustomersFeatureRoutes,
} from "./customers";

export {
  posEmployeesFeatureRoutes,
  posEmployeesRoutesModel,
  posEmployeesRouteKeys,
  getPosEmployeesRoute,
  buildPosEmployeesFeatureRoutes,
} from "./employees";

export {
  posDashboardFeatureRoutes,
  posDashboardRoutesModel,
  posDashboardRouteKeys,
  getPosDashboardRoute,
  buildPosDashboardFeatureRoutes,
} from "./dashboard";
