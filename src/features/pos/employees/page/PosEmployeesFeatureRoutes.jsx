import { posEmployeesRouteKeys } from "../model/posEmployeesRoutes";
import { buildPosEmployeesFeatureRoutes } from "../service/buildPosEmployeesFeatureRoutes";
import {
  PosEmployeesPage,
  PosEditEmployeePage,
  PosNewEmployeePage,
} from "./PosEmployeesPages";

const posEmployeesPageByRouteKey = {
  [posEmployeesRouteKeys.main]: <PosEmployeesPage />,
  [posEmployeesRouteKeys.editEmployee]: <PosEditEmployeePage />,
  [posEmployeesRouteKeys.newEmployee]: <PosNewEmployeePage />,
};

export const posEmployeesFeatureRoutes = buildPosEmployeesFeatureRoutes(posEmployeesPageByRouteKey);
