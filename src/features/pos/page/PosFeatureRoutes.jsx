import { PosAuthPage } from "./PosAuthPage";
import { PosCreateStorePage } from "./PosCreateStorePage";
import { PosMarketingPage } from "./PosMarketingPage";
import { PosCartPage } from "../sales/page/PosCartPage";
import { PosSalesPage } from "../sales/page/PosSalesPage";
import { buildPosFeatureRoutes } from "../service/buildPosFeatureRoutes";
import { posRouteKeys } from "../model/posRoutes";

const posPageByRouteKey = {
  [posRouteKeys.marketing]: <PosMarketingPage />,
  [posRouteKeys.login]: <PosAuthPage />,
  [posRouteKeys.createStore]: <PosCreateStorePage />,
  [posRouteKeys.sales]: <PosSalesPage />,
  [posRouteKeys.cart]: <PosCartPage />,
};

export const posFeatureRoutes = buildPosFeatureRoutes(posPageByRouteKey);
