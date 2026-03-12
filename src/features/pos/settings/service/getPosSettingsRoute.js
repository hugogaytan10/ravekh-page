import { posSettingsRoutesModel } from "../model/posSettingsRoutes";
import { createRouteGetter } from "../../service/routeFactory";

export const getPosSettingsRoute = createRouteGetter(posSettingsRoutesModel);
