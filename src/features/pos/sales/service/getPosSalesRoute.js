import { posSalesRoutesModel } from "../model/posSalesRoutes";
import { createRouteGetter } from "../../service/routeFactory";

export const getPosSalesRoute = createRouteGetter(posSalesRoutesModel);
