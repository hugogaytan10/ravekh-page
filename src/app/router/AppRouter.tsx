import { createBrowserRouter, Navigate } from "react-router-dom";
import { LandingFeaturePage } from "../../features/landing";
import { blogRoutes } from "./routes/blog.routes";
import { legalRoutes } from "./routes/legal.routes";
import { catalogoRoutes } from "./routes/catalogo.routes";
import { cuponesRoutes } from "./routes/cupones.routes";
import { posRoutes } from "./routes/pos.routes";

const featureRoutes = [...blogRoutes, ...legalRoutes, ...catalogoRoutes, ...cuponesRoutes, ...posRoutes];

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
