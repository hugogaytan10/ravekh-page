import { posReportsRoutesModel } from "../model/posReportsRoutes";
import { createRouteGetter } from "../../service/routeFactory";

export const getPosReportsRoute = createRouteGetter(posReportsRoutesModel);
