import { couponsRoutesModel } from "../model/couponsRoutes";

export const getCouponsRoute = (routeKey) => {
  return couponsRoutesModel[routeKey] ?? null;
};
