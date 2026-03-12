import { getPosRoute } from "./getPosRoute";

export const buildPosFeatureRoutes = (routePageMap) => {
  return Object.entries(routePageMap)
    .map(([routeKey, element]) => {
      const path = getPosRoute(routeKey);

      if (!path) {
        return null;
      }

      return { path, element };
    })
    .filter(Boolean);
};
