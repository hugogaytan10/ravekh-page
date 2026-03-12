import { posFinanceRoutesModel } from "../model/posFinanceRoutes";

export const getPosFinanceRoute = (routeKey) => {
  return posFinanceRoutesModel[routeKey] ?? null;
};
