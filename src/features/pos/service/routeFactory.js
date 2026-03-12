export const createRouteGetter = (routesModel) => {
  return (routeKey) => routesModel[routeKey] ?? null;
};

export const createFeatureRoutesBuilder = (getRoute, options = {}) => {
  const { includeKey = false } = options;

  return (routePageMap) => {
    return Object.entries(routePageMap)
      .map(([routeKey, element]) => {
        const path = getRoute(routeKey);

        if (!path) {
          return null;
        }

        return includeKey
          ? { key: routeKey, path, element }
          : { path, element };
      })
      .filter(Boolean);
  };
};
