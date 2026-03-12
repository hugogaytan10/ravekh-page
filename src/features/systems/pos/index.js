import {
  posFeatureRoutes,
  posSalesFeatureRoutes,
  posRoutesModel,
  posSalesRoutesModel,
  getPosRoute,
  getPosSalesRoute,
} from "../../pos";

export {
  posFeatureRoutes,
  posSalesFeatureRoutes,
  posRoutesModel,
  posSalesRoutesModel,
  getPosRoute,
  getPosSalesRoute,
};

export const posSystem = {
  key: "pos",
  label: "Sistema POS",
  routes: [...posFeatureRoutes, ...posSalesFeatureRoutes],
};
