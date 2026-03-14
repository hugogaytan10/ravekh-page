import { RouterProvider as ReactRouterProvider } from "react-router-dom";
import { independentAppRouter } from "../router/IndependentAppRouter";

export const IndependentRouterProvider = () => {
  return <ReactRouterProvider router={independentAppRouter} />;
};
