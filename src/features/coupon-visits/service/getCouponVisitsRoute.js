import { couponVisitsRoutesModel } from "../model/couponVisitsRoutes";

/**
 * @typedef {keyof typeof couponVisitsRoutesModel.customer} CouponVisitsCustomerRouteKey
 * @typedef {keyof typeof couponVisitsRoutesModel.backoffice} CouponVisitsBackofficeRouteKey
 * @typedef {"customer" | "backoffice"} CouponVisitsScope
 */

/**
 * @param {CouponVisitsCustomerRouteKey | CouponVisitsBackofficeRouteKey} routeKey
 * @param {CouponVisitsScope} [scope="customer"]
 * @returns {string | null}
 */
export const getCouponVisitsRoute = (routeKey, scope = "customer") => {
  if (couponVisitsRoutesModel[scope]?.[routeKey]) {
    return couponVisitsRoutesModel[scope][routeKey];
  }

  return Object.values(couponVisitsRoutesModel).find((scopeRoutes) => scopeRoutes?.[routeKey])?.[routeKey] ?? null;
};
