import { PosAuthPage } from "./PosAuthPage";
import { PosCreateStorePage } from "./PosCreateStorePage";
import { PosMarketingPage } from "./PosMarketingPage";
import { buildPosFeatureRoutes } from "../service/buildPosFeatureRoutes";
import { posRouteKeys } from "../model/posRoutes";
import { Navigate } from "react-router-dom";

const posPageByRouteKey = {
  [posRouteKeys.marketing]: <PosMarketingPage />,
  [posRouteKeys.login]: <PosAuthPage />,
  [posRouteKeys.createStore]: <PosCreateStorePage />,
};

export const posFeatureRoutes = buildPosFeatureRoutes(posPageByRouteKey);

export const posFeatureRouteAliases = [
  {
    path: "/sistema/pos",
    element: <PosMarketingPage />,
  },
  {
    path: "/sistema/pos/login",
    element: <PosAuthPage />,
  },
  {
    path: "/sistema/pos/crear-tienda",
    element: <PosCreateStorePage />,
  },
  {
    path: "/RavekhPos",
    element: <Navigate to="/sistema/pos" replace />,
  },
];
