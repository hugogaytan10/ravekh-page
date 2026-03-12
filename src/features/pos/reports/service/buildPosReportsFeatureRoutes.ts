import { getPosReportsRoute } from "./getPosReportsRoute";
import { createFeatureRoutesBuilder } from "../../service/routeFactory";
import type { PosReportsRouteKey } from "../model/posReportsRoutes";

export const buildPosReportsFeatureRoutes = createFeatureRoutesBuilder<PosReportsRouteKey>(getPosReportsRoute);
