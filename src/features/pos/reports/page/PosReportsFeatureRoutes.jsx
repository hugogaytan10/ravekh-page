import { posReportsRouteKeys } from "../model/posReportsRoutes";
import { buildPosReportsFeatureRoutes } from "../service/buildPosReportsFeatureRoutes";
import {
  PosMainReportsPage,
  PosReportIncomePage,
  PosReportSalesPage,
  PosReportOrderDetailsPage,
  PosReportCommandDetailsPage,
  PosCardIncomePage,
  PosCashIncomePage,
  PosBestSellingPage,
  PosBestCategorySellingPage,
} from "./PosReportsPages";

const posReportsPageByRouteKey = {
  [posReportsRouteKeys.main]: <PosMainReportsPage />,
  [posReportsRouteKeys.income]: <PosReportIncomePage />,
  [posReportsRouteKeys.sales]: <PosReportSalesPage />,
  [posReportsRouteKeys.orderDetails]: <PosReportOrderDetailsPage />,
  [posReportsRouteKeys.commandDetails]: <PosReportCommandDetailsPage />,
  [posReportsRouteKeys.cardIncome]: <PosCardIncomePage />,
  [posReportsRouteKeys.cashIncome]: <PosCashIncomePage />,
  [posReportsRouteKeys.bestSelling]: <PosBestSellingPage />,
  [posReportsRouteKeys.bestCategorySelling]: <PosBestCategorySellingPage />,
};

export const posReportsFeatureRoutes = buildPosReportsFeatureRoutes(posReportsPageByRouteKey);
