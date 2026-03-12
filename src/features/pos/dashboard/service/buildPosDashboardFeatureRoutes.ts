import { getPosDashboardRoute } from "./getPosDashboardRoute";
import { createFeatureRoutesBuilder } from "../../service/routeFactory";
import type { PosDashboardRouteKey } from "../model/posDashboardRoutes";

export const buildPosDashboardFeatureRoutes = createFeatureRoutesBuilder<PosDashboardRouteKey>(getPosDashboardRoute);
