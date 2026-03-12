import { posReportsRoutesModel, type PosReportsRouteKey } from "../model/posReportsRoutes";
import { createRouteGetter } from "../../service/routeFactory";

const getRoute = createRouteGetter(posReportsRoutesModel);

export const getPosReportsRoute = (routeKey: PosReportsRouteKey) => getRoute(routeKey);
