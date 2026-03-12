import { getPosEmployeesRoute } from "./getPosEmployeesRoute";
import { createFeatureRoutesBuilder } from "../../service/routeFactory";

export const buildPosEmployeesFeatureRoutes = createFeatureRoutesBuilder(getPosEmployeesRoute);
