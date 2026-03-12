import { posDashboardRoutesModel } from "../model/posDashboardRoutes";
import { createRouteGetter } from "../../service/routeFactory";

export const getPosDashboardRoute = createRouteGetter(posDashboardRoutesModel);
