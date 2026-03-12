import { posCustomersRoutesModel } from "../model/posCustomersRoutes";

export const getPosCustomersRoute = (routeKey) => {
  return posCustomersRoutesModel[routeKey] ?? null;
};
