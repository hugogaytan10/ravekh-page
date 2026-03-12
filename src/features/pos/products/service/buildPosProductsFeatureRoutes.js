import { getPosProductsRoute } from "./getPosProductsRoute";

export const buildPosProductsFeatureRoutes = (routePageMap) => {
  return Object.entries(routePageMap)
    .map(([routeKey, element]) => {
      const path = getPosProductsRoute(routeKey);

      if (!path) {
        return null;
      }

      return { path, element };
    })
    .filter(Boolean);
};
