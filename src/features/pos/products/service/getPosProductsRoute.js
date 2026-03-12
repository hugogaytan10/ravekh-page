import { posProductsRoutesModel } from "../model/posProductsRoutes";

export const getPosProductsRoute = (routeKey) => {
  return posProductsRoutesModel[routeKey] ?? null;
};
