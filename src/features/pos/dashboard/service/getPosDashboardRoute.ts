import { posDashboardRoutesModel, type PosDashboardRouteKey } from "../model/posDashboardRoutes";
import { createRouteGetter } from "../../service/routeFactory";

const getRoute = createRouteGetter(posDashboardRoutesModel);

export const getPosDashboardRoute = (routeKey: PosDashboardRouteKey) => getRoute(routeKey);
