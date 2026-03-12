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

const posRouteGroups = [
  posFeatureRoutes,
  posSalesFeatureRoutes,
  posProductsFeatureRoutes,
  posFinanceFeatureRoutes,
  posReportsFeatureRoutes,
  posSettingsFeatureRoutes,
  posCustomersFeatureRoutes,
  posEmployeesFeatureRoutes,
  posDashboardFeatureRoutes,
];

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
  routes: posRouteGroups.flat(),
};
