import { getPosEmployeesRoute } from "./getPosEmployeesRoute";

export const buildPosEmployeesFeatureRoutes = (routePageMap) => {
  return Object.entries(routePageMap)
    .map(([routeKey, element]) => {
      const path = getPosEmployeesRoute(routeKey);

      if (!path) {
        return null;
      }

      return { path, element };
    })
    .filter(Boolean);
};
