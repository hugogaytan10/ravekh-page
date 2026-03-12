import { getPosProductsRoute } from "./getPosProductsRoute";
import { createFeatureRoutesBuilder } from "../../service/routeFactory";
import type { PosProductsRouteKey } from "../model/posProductsRoutes";

export const buildPosProductsFeatureRoutes = createFeatureRoutesBuilder<PosProductsRouteKey>(getPosProductsRoute);
