import { MainReports } from "../../../../Components/CatalogoWeb/PuntoVenta/Reports/MainReports";
import ReportIncome from "../../../../Components/CatalogoWeb/PuntoVenta/Reports/Incomes/ReportIncome";
import ReportSales from "../../../../Components/CatalogoWeb/PuntoVenta/Reports/Sales/ReportSales";
import ReportOrderDetails from "../../../../Components/CatalogoWeb/PuntoVenta/Reports/Sales/ReportOrderDetails";
import ReportCommandDetails from "../../../../Components/CatalogoWeb/PuntoVenta/Reports/Sales/ReportCommandDetails";
import CardIncome from "../../../../Components/CatalogoWeb/PuntoVenta/Reports/Sales/CardIncome";
import CashIncome from "../../../../Components/CatalogoWeb/PuntoVenta/Reports/Sales/CashIncome";
import BestSelling from "../../../../Components/CatalogoWeb/PuntoVenta/Reports/BestSellingProducts/BestSelling";
import BestCategorySelling from "../../../../Components/CatalogoWeb/PuntoVenta/Reports/BestSellingProducts/BestCategorySelling";

export const PosMainReportsPage = () => <MainReports />;
export const PosReportIncomePage = () => <ReportIncome />;
export const PosReportSalesPage = () => <ReportSales />;
export const PosReportOrderDetailsPage = () => <ReportOrderDetails />;
export const PosReportCommandDetailsPage = () => <ReportCommandDetails />;
export const PosCardIncomePage = () => <CardIncome />;
export const PosCashIncomePage = () => <CashIncome />;
export const PosBestSellingPage = () => <BestSelling />;
export const PosBestCategorySellingPage = () => <BestCategorySelling />;
