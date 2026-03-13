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
  return couponVisitsRoutesModel[scope]?.[routeKey] ?? null;
};
