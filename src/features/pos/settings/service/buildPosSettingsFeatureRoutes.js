import { getPosSettingsRoute } from "./getPosSettingsRoute";

export const buildPosSettingsFeatureRoutes = (routePageMap) => {
  return Object.entries(routePageMap)
    .map(([routeKey, element]) => {
      const path = getPosSettingsRoute(routeKey);

      if (!path) {
        return null;
      }

      return { path, element };
    })
    .filter(Boolean);
};
