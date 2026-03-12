import { posSalesRoutesModel } from "../model/posSalesRoutes";

export const getPosSalesRoute = (routeKey) => {
  return posSalesRoutesModel[routeKey] ?? null;
};
