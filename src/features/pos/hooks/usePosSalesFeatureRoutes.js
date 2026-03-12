import { useMemo } from "react";
import { buildPosSalesFeatureRoutes } from "../service/buildPosSalesFeatureRoutes";

export const usePosSalesFeatureRoutes = (routePageMap) => {
  return useMemo(() => buildPosSalesFeatureRoutes(routePageMap), [routePageMap]);
};
