import { createBrowserRouter, Navigate } from "react-router-dom";
import { LandingFeaturePage } from "../../features/landing";
import { systemRoutes } from "../../features/systems";
import { blogRoutes } from "./routes/blog.routes";
import { legalRoutes } from "./routes/legal.routes";

const featureRoutes = [...blogRoutes, ...legalRoutes, ...systemRoutes];

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <LandingFeaturePage />,
  },
  ...featureRoutes,
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
