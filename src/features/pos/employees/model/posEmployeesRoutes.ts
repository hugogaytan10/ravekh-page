export const posEmployeesRoutesModel = {
  main: "/employees",
  editEmployee: "/edit-employee/:id",
  newEmployee: "/new-employee",
} as const;

export const posEmployeesRouteKeys = Object.freeze({
  main: "main",
  editEmployee: "editEmployee",
  newEmployee: "newEmployee",
} as const);

export type PosEmployeesRouteKey = keyof typeof posEmployeesRoutesModel;
