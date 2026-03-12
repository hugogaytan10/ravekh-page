import { posReportsRoutesModel } from "../model/posReportsRoutes";

export const getPosReportsRoute = (routeKey) => {
  return posReportsRoutesModel[routeKey] ?? null;
};
