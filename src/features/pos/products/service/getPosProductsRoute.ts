import { posProductsRoutesModel, type PosProductsRouteKey } from "../model/posProductsRoutes";
import { createRouteGetter } from "../../service/routeFactory";

const getRoute = createRouteGetter(posProductsRoutesModel);

export const getPosProductsRoute = (routeKey: PosProductsRouteKey) => getRoute(routeKey);
