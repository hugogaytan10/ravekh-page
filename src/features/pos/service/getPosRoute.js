import { posRoutesModel } from "../model/posRoutes";

export const getPosRoute = (routeKey) => {
  return posRoutesModel[routeKey] ?? null;
};
