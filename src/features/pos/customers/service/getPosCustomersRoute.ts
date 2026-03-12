import { posCustomersRoutesModel, type PosCustomersRouteKey } from "../model/posCustomersRoutes";
import { createRouteGetter } from "../../service/routeFactory";

const getRoute = createRouteGetter(posCustomersRoutesModel);

export const getPosCustomersRoute = (routeKey: PosCustomersRouteKey) => getRoute(routeKey);
