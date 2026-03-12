import { getPosProductsRoute } from "./getPosProductsRoute";
import { createFeatureRoutesBuilder } from "../../service/routeFactory";

export const buildPosProductsFeatureRoutes = createFeatureRoutesBuilder(getPosProductsRoute);
