import { getPosSalesRoute } from "./getPosSalesRoute";
import { createFeatureRoutesBuilder } from "../../service/routeFactory";

export const buildPosSalesFeatureRoutes = createFeatureRoutesBuilder(getPosSalesRoute, {
  includeKey: true,
});
