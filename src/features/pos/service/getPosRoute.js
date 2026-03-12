import { posRoutesModel } from "../model/posRoutes";
import { createRouteGetter } from "./routeFactory";

export const getPosRoute = createRouteGetter(posRoutesModel);
