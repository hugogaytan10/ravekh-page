import { PosAuthPage } from "./PosAuthPage";
import { PosCartPage } from "./PosCartPage";
import { PosCreateStorePage } from "./PosCreateStorePage";
import { PosMarketingPage } from "./PosMarketingPage";
import { PosSalesPage } from "./PosSalesPage";
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
