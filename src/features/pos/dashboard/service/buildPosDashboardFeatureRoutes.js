import { getPosDashboardRoute } from "./getPosDashboardRoute";
import { createFeatureRoutesBuilder } from "../../service/routeFactory";

export const buildPosDashboardFeatureRoutes = createFeatureRoutesBuilder(getPosDashboardRoute);
