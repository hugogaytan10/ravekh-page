import { useMemo } from "react";
import { buildPosFeatureRoutes } from "../service/buildPosFeatureRoutes";

export const usePosFeatureRoutes = (routePageMap) => {
  return useMemo(() => buildPosFeatureRoutes(routePageMap), [routePageMap]);
};
