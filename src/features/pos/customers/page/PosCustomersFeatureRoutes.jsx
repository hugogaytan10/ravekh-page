import { posCustomersRouteKeys } from "../model/posCustomersRoutes";
import { buildPosCustomersFeatureRoutes } from "../service/buildPosCustomersFeatureRoutes";
import {
  PosCustomersPage,
  PosOrdersByCustomerPage,
  PosEditCustomerPage,
  PosClientSelectPage,
} from "./PosCustomersPages";

const posCustomersPageByRouteKey = {
  [posCustomersRouteKeys.main]: <PosCustomersPage />,
  [posCustomersRouteKeys.ordersByCustomer]: <PosOrdersByCustomerPage />,
  [posCustomersRouteKeys.editCustomer]: <PosEditCustomerPage />,
  [posCustomersRouteKeys.clientSelect]: <PosClientSelectPage />,
};

export const posCustomersFeatureRoutes = buildPosCustomersFeatureRoutes(posCustomersPageByRouteKey);
