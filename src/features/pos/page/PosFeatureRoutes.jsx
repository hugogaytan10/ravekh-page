import { PosAuthPage } from "./PosAuthPage";
import { PosCreateStorePage } from "./PosCreateStorePage";
import { PosMarketingPage } from "./PosMarketingPage";
import { buildPosFeatureRoutes } from "../service/buildPosFeatureRoutes";
import { posRouteKeys } from "../model/posRoutes";

const posPageByRouteKey = {
  [posRouteKeys.marketing]: <PosMarketingPage />,
  [posRouteKeys.login]: <PosAuthPage />,
  [posRouteKeys.createStore]: <PosCreateStorePage />,
};

export const posFeatureRoutes = buildPosFeatureRoutes(posPageByRouteKey);
