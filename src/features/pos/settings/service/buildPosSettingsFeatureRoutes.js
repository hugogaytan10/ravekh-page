import { getPosSettingsRoute } from "./getPosSettingsRoute";
import { createFeatureRoutesBuilder } from "../../service/routeFactory";

export const buildPosSettingsFeatureRoutes = createFeatureRoutesBuilder(getPosSettingsRoute);
