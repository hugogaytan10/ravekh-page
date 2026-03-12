import { catalogWebRoutesModel } from "../model/catalogWebRoutes";

export const getCatalogWebRoute = (routeKey) => {
  return catalogWebRoutesModel[routeKey] ?? null;
};
