import { getPosReportsRoute } from "./getPosReportsRoute";
import { createFeatureRoutesBuilder } from "../../service/routeFactory";

export const buildPosReportsFeatureRoutes = createFeatureRoutesBuilder(getPosReportsRoute);
