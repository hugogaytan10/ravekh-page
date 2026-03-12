import { posEmployeesRoutesModel, type PosEmployeesRouteKey } from "../model/posEmployeesRoutes";
import { createRouteGetter } from "../../service/routeFactory";

const getRoute = createRouteGetter(posEmployeesRoutesModel);

export const getPosEmployeesRoute = (routeKey: PosEmployeesRouteKey) => getRoute(routeKey);
