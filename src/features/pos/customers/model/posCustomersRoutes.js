export const posCustomersRoutesModel = {
  main: "/clients",
  ordersByCustomer: "/orders-by-customer/:customerId/:period",
  editCustomer: "/edit-customer/:id",
  clientSelect: "/client-select",
};

export const posCustomersRouteKeys = Object.freeze({
  main: "main",
  ordersByCustomer: "ordersByCustomer",
  editCustomer: "editCustomer",
  clientSelect: "clientSelect",
});
