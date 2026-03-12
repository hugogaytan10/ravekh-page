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
