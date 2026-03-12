import { posSettingsRoutesModel } from "../model/posSettingsRoutes";

export const getPosSettingsRoute = (routeKey) => {
  return posSettingsRoutesModel[routeKey] ?? null;
};
