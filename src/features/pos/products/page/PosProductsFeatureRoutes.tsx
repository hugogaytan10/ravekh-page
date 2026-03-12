import { posProductsRouteKeys } from "../model/posProductsRoutes";
import { buildPosProductsFeatureRoutes } from "../service/buildPosProductsFeatureRoutes";
import {
  PosMainProductsPage,
  PosAddProductProductsPage,
  PosSelectCategoryProductPage,
  PosEditProductPage,
  PosEditCategoryPage,
  PosProductsListPage,
  PosStockProductsPage,
  PosSearchProductProductsPage,
  PosProductsFilterPage,
  PosKeyboardProductPage,
} from "./PosProductsPages";

const posProductsPageByRouteKey = {
  [posProductsRouteKeys.main]: <PosMainProductsPage />,
  [posProductsRouteKeys.addProduct]: <PosAddProductProductsPage />,
  [posProductsRouteKeys.selectCategory]: <PosSelectCategoryProductPage />,
  [posProductsRouteKeys.editProduct]: <PosEditProductPage />,
  [posProductsRouteKeys.editCategory]: <PosEditCategoryPage />,
  [posProductsRouteKeys.list]: <PosProductsListPage />,
  [posProductsRouteKeys.stock]: <PosStockProductsPage />,
  [posProductsRouteKeys.searchProduct]: <PosSearchProductProductsPage />,
  [posProductsRouteKeys.filter]: <PosProductsFilterPage />,
  [posProductsRouteKeys.keyboardProduct]: <PosKeyboardProductPage />,
};

export const posProductsFeatureRoutes = buildPosProductsFeatureRoutes(posProductsPageByRouteKey);
