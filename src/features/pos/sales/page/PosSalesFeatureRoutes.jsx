import { posSalesRouteKeys } from "../model/posSalesRoutes";
import { buildPosSalesFeatureRoutes } from "../service/buildPosSalesFeatureRoutes";
import { PosSalesPage } from "./PosSalesPage";
import { PosCartPage } from "./PosCartPage";
import { PosDiscountScreenPage } from "./PosDiscountScreenPage";
import { PosPaymentTypeScreenPage } from "./PosPaymentTypeScreenPage";
import { PosPaymentScreenPage } from "./PosPaymentScreenPage";
import { PosFinishScreenPage } from "./PosFinishScreenPage";
import { PosAddProductSalesPage } from "../products/page/PosAddProductSalesPage";
import { PosCategoriasScreenSalesPage } from "../products/page/PosCategoriasScreenSalesPage";
import { PosAddCategoriesSalesPage } from "../products/page/PosAddCategoriesSalesPage";
import { PosScannerSalesPage } from "../products/page/PosScannerSalesPage";
import { PosSearchScreenSalesPage } from "../products/page/PosSearchScreenSalesPage";
import { PosQuantityNextSellPage } from "./PosQuantityNextSellPage";

const posSalesPageByRouteKey = {
  [posSalesRouteKeys.main]: <PosSalesPage />,
  [posSalesRouteKeys.cart]: <PosCartPage />,
  [posSalesRouteKeys.discount]: <PosDiscountScreenPage />,
  [posSalesRouteKeys.paymentType]: <PosPaymentTypeScreenPage />,
  [posSalesRouteKeys.payment]: <PosPaymentScreenPage />,
  [posSalesRouteKeys.finish]: <PosFinishScreenPage />,
  [posSalesRouteKeys.addProduct]: <PosAddProductSalesPage />,
  [posSalesRouteKeys.selectCategorySales]: <PosCategoriasScreenSalesPage />,
  [posSalesRouteKeys.addCategorySales]: <PosAddCategoriesSalesPage />,
  [posSalesRouteKeys.scannerSales]: <PosScannerSalesPage />,
  [posSalesRouteKeys.searchProductSales]: <PosSearchScreenSalesPage />,
  [posSalesRouteKeys.nextQuantitySell]: <PosQuantityNextSellPage />,
};

export const posSalesFeatureRoutes = buildPosSalesFeatureRoutes(posSalesPageByRouteKey);
