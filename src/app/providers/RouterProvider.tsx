import { RouterProvider as ReactRouterProvider } from "react-router-dom";
import { appRouter } from "../router/AppRouter";

export const RouterProvider = () => {
  return <ReactRouterProvider router={appRouter} />;
};
