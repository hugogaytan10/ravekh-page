import { getPosSettingsRoute } from "./getPosSettingsRoute";
import { createFeatureRoutesBuilder } from "../../service/routeFactory";
import type { PosSettingsRouteKey } from "../model/posSettingsRoutes";

export const buildPosSettingsFeatureRoutes = createFeatureRoutesBuilder<PosSettingsRouteKey>(getPosSettingsRoute);
