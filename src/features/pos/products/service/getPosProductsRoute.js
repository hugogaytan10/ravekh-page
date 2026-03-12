import { posProductsRoutesModel } from "../model/posProductsRoutes";
import { createRouteGetter } from "../../service/routeFactory";

export const getPosProductsRoute = createRouteGetter(posProductsRoutesModel);
