import { posFinanceRoutesModel } from "../model/posFinanceRoutes";
import { createRouteGetter } from "../../service/routeFactory";

export const getPosFinanceRoute = createRouteGetter(posFinanceRoutesModel);
