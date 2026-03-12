export const posCustomersRoutesModel = {
  main: "/clients",
  ordersByCustomer: "/orders-by-customer/:customerId/:period",
  editCustomer: "/edit-customer/:id",
  clientSelect: "/client-select",
} as const;

export const posCustomersRouteKeys = Object.freeze({
  main: "main",
  ordersByCustomer: "ordersByCustomer",
  editCustomer: "editCustomer",
  clientSelect: "clientSelect",
} as const);

export type PosCustomersRouteKey = keyof typeof posCustomersRoutesModel;
