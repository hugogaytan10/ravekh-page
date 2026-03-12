import { getPosCustomersRoute } from "./getPosCustomersRoute";
import { createFeatureRoutesBuilder } from "../../service/routeFactory";
import type { PosCustomersRouteKey } from "../model/posCustomersRoutes";

export const buildPosCustomersFeatureRoutes = createFeatureRoutesBuilder<PosCustomersRouteKey>(getPosCustomersRoute);
