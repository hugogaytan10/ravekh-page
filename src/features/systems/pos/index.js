import {
  posFeatureRoutes,
  posSalesFeatureRoutes,
  posSalesFeatureRouteAliases,
  posProductsFeatureRoutes,
  posFinanceFeatureRoutes,
  posReportsFeatureRoutes,
  posSettingsFeatureRoutes,
  posCustomersFeatureRoutes,
  posEmployeesFeatureRoutes,
  posDashboardFeatureRoutes,
  posFeatureRouteAliases,
  posRoutesModel,
  posSalesRoutesModel,
  getPosRoute,
  getPosSalesRoute,
} from "../../pos";

const posRouteGroups = [
  posFeatureRoutes,
  posFeatureRouteAliases,
  posSalesFeatureRoutes,
  posSalesFeatureRouteAliases,
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
  posSalesFeatureRouteAliases,
  posProductsFeatureRoutes,
  posFinanceFeatureRoutes,
  posReportsFeatureRoutes,
  posSettingsFeatureRoutes,
  posCustomersFeatureRoutes,
  posEmployeesFeatureRoutes,
  posDashboardFeatureRoutes,
  posFeatureRouteAliases,
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
