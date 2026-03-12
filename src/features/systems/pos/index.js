import {
  posFeatureRoutes,
  posSalesFeatureRoutes,
  posProductsFeatureRoutes,
  posFinanceFeatureRoutes,
  posReportsFeatureRoutes,
  posSettingsFeatureRoutes,
  posCustomersFeatureRoutes,
  posEmployeesFeatureRoutes,
  posDashboardFeatureRoutes,
  posRoutesModel,
  posSalesRoutesModel,
  getPosRoute,
  getPosSalesRoute,
} from "../../pos";

export {
  posFeatureRoutes,
  posSalesFeatureRoutes,
  posProductsFeatureRoutes,
  posFinanceFeatureRoutes,
  posReportsFeatureRoutes,
  posSettingsFeatureRoutes,
  posCustomersFeatureRoutes,
  posEmployeesFeatureRoutes,
  posDashboardFeatureRoutes,
  posRoutesModel,
  posSalesRoutesModel,
  getPosRoute,
  getPosSalesRoute,
};

export const posSystem = {
  key: "pos",
  label: "Sistema POS",
  routes: [
    ...posFeatureRoutes,
    ...posSalesFeatureRoutes,
    ...posProductsFeatureRoutes,
    ...posFinanceFeatureRoutes,
    ...posReportsFeatureRoutes,
    ...posSettingsFeatureRoutes,
    ...posCustomersFeatureRoutes,
    ...posEmployeesFeatureRoutes,
    ...posDashboardFeatureRoutes,
  ],
};
