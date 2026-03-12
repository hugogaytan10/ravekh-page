import { getPosRoute } from "./getPosRoute";
import { createFeatureRoutesBuilder } from "./routeFactory";

export const buildPosFeatureRoutes = createFeatureRoutesBuilder(getPosRoute);
