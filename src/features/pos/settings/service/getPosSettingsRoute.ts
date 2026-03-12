import { posSettingsRoutesModel, type PosSettingsRouteKey } from "../model/posSettingsRoutes";
import { createRouteGetter } from "../../service/routeFactory";

const getRoute = createRouteGetter(posSettingsRoutesModel);

export const getPosSettingsRoute = (routeKey: PosSettingsRouteKey) => getRoute(routeKey);
