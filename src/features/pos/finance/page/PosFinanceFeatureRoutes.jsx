import { posFinanceRouteKeys } from "../model/posFinanceRoutes";
import { buildPosFinanceFeatureRoutes } from "../service/buildPosFinanceFeatureRoutes";
import { PosMainFinancesPage, PosAddRegisterPage } from "./PosFinancePages";

const posFinancePageByRouteKey = {
  [posFinanceRouteKeys.main]: <PosMainFinancesPage />,
  [posFinanceRouteKeys.addRegister]: <PosAddRegisterPage />,
};

export const posFinanceFeatureRoutes = buildPosFinanceFeatureRoutes(posFinancePageByRouteKey);
