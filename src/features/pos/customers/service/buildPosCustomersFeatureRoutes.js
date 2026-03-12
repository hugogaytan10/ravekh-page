import { getPosCustomersRoute } from "./getPosCustomersRoute";
import { createFeatureRoutesBuilder } from "../../service/routeFactory";

export const buildPosCustomersFeatureRoutes = createFeatureRoutesBuilder(getPosCustomersRoute);
