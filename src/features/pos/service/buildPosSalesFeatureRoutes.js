import { getPosSalesRoute } from "./getPosSalesRoute";

export const buildPosSalesFeatureRoutes = (routePageMap) => {
  return Object.entries(routePageMap)
    .map(([routeKey, element]) => {
      const path = getPosSalesRoute(routeKey);

      if (!path) {
        return null;
      }

      return {
        key: routeKey,
        path,
        element,
      };
    })
    .filter(Boolean);
};
