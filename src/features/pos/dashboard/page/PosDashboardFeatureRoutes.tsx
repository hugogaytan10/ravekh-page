import { posDashboardRouteKeys } from "../model/posDashboardRoutes";
import { buildPosDashboardFeatureRoutes } from "../service/buildPosDashboardFeatureRoutes";
import { PosDashboardPage } from "./PosDashboardPage";

const posDashboardPageByRouteKey = {
  [posDashboardRouteKeys.main]: <PosDashboardPage />,
};

export const posDashboardFeatureRoutes = buildPosDashboardFeatureRoutes(posDashboardPageByRouteKey);
