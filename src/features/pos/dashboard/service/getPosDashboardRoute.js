import { posDashboardRoutesModel } from "../model/posDashboardRoutes";

export const getPosDashboardRoute = (routeKey) => {
  return posDashboardRoutesModel[routeKey] ?? null;
};
