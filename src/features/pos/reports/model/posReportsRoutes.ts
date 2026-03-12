export const posReportsRoutesModel = {
  main: "/main-reports",
  income: "/report-income/:period/:businessId",
  sales: "/report-sales/:period/:businessId",
  orderDetails: "/report-order-details/:orderId",
  commandDetails: "/report-command-details/:commandId",
  cardIncome: "/card-income/:period/:businessId",
  cashIncome: "/cash-income/:period/:businessId",
  bestSelling: "/best-selling/:period/:businessId",
  bestCategorySelling: "/best-category-selling/:period/:businessId",
} as const;

export const posReportsRouteKeys = Object.freeze({
  main: "main",
  income: "income",
  sales: "sales",
  orderDetails: "orderDetails",
  commandDetails: "commandDetails",
  cardIncome: "cardIncome",
  cashIncome: "cashIncome",
  bestSelling: "bestSelling",
  bestCategorySelling: "bestCategorySelling",
} as const);

export type PosReportsRouteKey = keyof typeof posReportsRoutesModel;
