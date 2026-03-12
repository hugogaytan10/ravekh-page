import { getPosEmployeesRoute } from "./getPosEmployeesRoute";
import { createFeatureRoutesBuilder } from "../../service/routeFactory";
import type { PosEmployeesRouteKey } from "../model/posEmployeesRoutes";

export const buildPosEmployeesFeatureRoutes = createFeatureRoutesBuilder<PosEmployeesRouteKey>(getPosEmployeesRoute);
