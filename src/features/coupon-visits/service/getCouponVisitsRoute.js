import { couponVisitsRoutesModel } from "../model/couponVisitsRoutes";

export const getCouponVisitsRoute = (routeKey, scope = "customer") => {
  return couponVisitsRoutesModel[scope]?.[routeKey] ?? null;
};
