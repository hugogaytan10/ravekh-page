import { Navigate } from "react-router-dom";
import { posSalesRouteKeys } from "../model/posSalesRoutes";
import { buildPosSalesFeatureRoutes } from "../service/buildPosSalesFeatureRoutes";
import { PosSalesPage } from "./PosSalesPage";
import { PosCartPage } from "./PosCartPage";
import { PosDiscountScreenPage } from "./PosDiscountScreenPage";
import { PosPaymentTypeScreenPage } from "./PosPaymentTypeScreenPage";
import { PosPaymentScreenPage } from "./PosPaymentScreenPage";
import { PosFinishScreenPage } from "./PosFinishScreenPage";
import { PosAddProductSalesPage } from "../products/page/PosAddProductSalesPage";
import { PosCategoriasScreenSalesPage } from "../products/page/PosCategoriasScreenSalesPage";
import { PosAddCategoriesSalesPage } from "../products/page/PosAddCategoriesSalesPage";
import { PosScannerSalesPage } from "../products/page/PosScannerSalesPage";
import { PosSearchScreenSalesPage } from "../products/page/PosSearchScreenSalesPage";
import { PosQuantityNextSellPage } from "./PosQuantityNextSellPage";

const posSalesPageByRouteKey = {
  [posSalesRouteKeys.main]: <PosSalesPage />,
  [posSalesRouteKeys.cart]: <PosCartPage />,
  [posSalesRouteKeys.discount]: <PosDiscountScreenPage />,
  [posSalesRouteKeys.paymentType]: <PosPaymentTypeScreenPage />,
  [posSalesRouteKeys.payment]: <PosPaymentScreenPage />,
  [posSalesRouteKeys.finish]: <PosFinishScreenPage />,
  [posSalesRouteKeys.addProduct]: <PosAddProductSalesPage />,
  [posSalesRouteKeys.selectCategorySales]: <PosCategoriasScreenSalesPage />,
  [posSalesRouteKeys.addCategorySales]: <PosAddCategoriesSalesPage />,
  [posSalesRouteKeys.scannerSales]: <PosScannerSalesPage />,
  [posSalesRouteKeys.searchProductSales]: <PosSearchScreenSalesPage />,
  [posSalesRouteKeys.nextQuantitySell]: <PosQuantityNextSellPage />,
};

export const posSalesFeatureRoutes = buildPosSalesFeatureRoutes(posSalesPageByRouteKey);

export const posSalesFeatureRouteAliases = [
  { path: "/MainSales", element: <Navigate to="/sistema/pos/ventas" replace /> },
  { path: "/MainCart", element: <Navigate to="/sistema/pos/ventas/carrito" replace /> },
  { path: "/DiscountScreen", element: <Navigate to="/sistema/pos/ventas/descuento" replace /> },
  { path: "/payment-type", element: <Navigate to="/sistema/pos/ventas/tipo-pago" replace /> },
  { path: "/payment", element: <Navigate to="/sistema/pos/ventas/pago" replace /> },
  { path: "/finish", element: <Navigate to="/sistema/pos/ventas/finalizar" replace /> },
  { path: "/add-product", element: <Navigate to="/sistema/pos/ventas/productos/agregar" replace /> },
  { path: "/select-caterory-sales", element: <Navigate to="/sistema/pos/ventas/categorias" replace /> },
  { path: "/add-category-sales", element: <Navigate to="/sistema/pos/ventas/categorias/agregar" replace /> },
  { path: "/scanner-sales", element: <Navigate to="/sistema/pos/ventas/scanner" replace /> },
  { path: "/search-product", element: <Navigate to="/sistema/pos/ventas/buscar-producto" replace /> },
  { path: "/next-quantity-sell", element: <Navigate to="/sistema/pos/ventas/cantidad" replace /> },
];
