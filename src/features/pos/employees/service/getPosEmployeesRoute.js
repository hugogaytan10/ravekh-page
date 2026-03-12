import { posEmployeesRoutesModel } from "../model/posEmployeesRoutes";

export const getPosEmployeesRoute = (routeKey) => {
  return posEmployeesRoutesModel[routeKey] ?? null;
};
