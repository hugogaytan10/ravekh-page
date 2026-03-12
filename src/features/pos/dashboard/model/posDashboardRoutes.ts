export const posDashboardRoutesModel = {
  main: "/dashboard",
} as const;

export const posDashboardRouteKeys = Object.freeze({
  main: "main",
} as const);

export type PosDashboardRouteKey = keyof typeof posDashboardRoutesModel;
