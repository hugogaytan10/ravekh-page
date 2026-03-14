import { createBrowserRouter, Navigate } from "react-router-dom";
import { LandingFeaturePage } from "../../features/landing";
import { legalRoutes } from "./routes/legal.routes";

const independentFeatureRoutes = [...legalRoutes];

export const independentAppRouter = createBrowserRouter([
  {
    path: "/",
    element: <LandingFeaturePage />,
  },
  ...independentFeatureRoutes,
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
