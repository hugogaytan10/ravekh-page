import { couponsRoutesModel } from "../model/couponsRoutes";

/**
 * @typedef {keyof typeof couponsRoutesModel} CouponsRouteKey
 */

/**
 * @param {CouponsRouteKey} routeKey
 * @returns {string | null}
 */
export const getCouponsRoute = (routeKey) => {
  return couponsRoutesModel[routeKey] ?? null;
};
