import { posCustomersRoutesModel } from "../model/posCustomersRoutes";
import { createRouteGetter } from "../../service/routeFactory";

export const getPosCustomersRoute = createRouteGetter(posCustomersRoutesModel);
