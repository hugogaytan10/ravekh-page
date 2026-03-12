import { posEmployeesRoutesModel } from "../model/posEmployeesRoutes";
import { createRouteGetter } from "../../service/routeFactory";

export const getPosEmployeesRoute = createRouteGetter(posEmployeesRoutesModel);
