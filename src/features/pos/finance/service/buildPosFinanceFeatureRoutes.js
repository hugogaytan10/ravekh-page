import { getPosFinanceRoute } from "./getPosFinanceRoute";
import { createFeatureRoutesBuilder } from "../../service/routeFactory";

export const buildPosFinanceFeatureRoutes = createFeatureRoutesBuilder(getPosFinanceRoute);
