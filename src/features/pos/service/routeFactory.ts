import type { ReactNode } from "react";

export type RoutesModel = Record<string, string>;
export type RoutePageMap<RouteKey extends string> = Partial<Record<RouteKey, ReactNode>>;

export type FeatureRoute<RouteKey extends string = string> = {
  path: string;
  element: ReactNode;
  key?: RouteKey;
};

export const createRouteGetter = <Routes extends RoutesModel>(routesModel: Routes) => {
  return (routeKey: keyof Routes | string): string | null => routesModel[routeKey as keyof Routes] ?? null;
};

export const createFeatureRoutesBuilder = <RouteKey extends string>(
  getRoute: (routeKey: RouteKey) => string | null,
  options: { includeKey?: boolean } = {},
) => {
  const { includeKey = false } = options;

  return (routePageMap: RoutePageMap<RouteKey>): FeatureRoute<RouteKey>[] =>
    Object.entries(routePageMap)
      .map(([routeKey, element]) => {
        const path = getRoute(routeKey as RouteKey);

        if (!path || !element) {
          return null;
        }

        return includeKey
          ? { key: routeKey as RouteKey, path, element }
          : { path, element };
      })
      .filter((route): route is FeatureRoute<RouteKey> => route !== null);
};
