import { getPosReportsRoute } from "./getPosReportsRoute";

export const buildPosReportsFeatureRoutes = (routePageMap) => {
  return Object.entries(routePageMap)
    .map(([routeKey, element]) => {
      const path = getPosReportsRoute(routeKey);

      if (!path) {
        return null;
      }

      return { path, element };
    })
    .filter(Boolean);
};
