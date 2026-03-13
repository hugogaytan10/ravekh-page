import { catalogWebRouteKeys, catalogWebRoutesModel } from "../model/catalogWebRoutes";
import { CatalogWebPage } from "./CatalogWebPage";
import { CatalogProductDetailPage } from "./CatalogProductDetailPage";
import { CatalogOrderPage } from "./CatalogOrderPage";
import { CatalogOrderInfoPage } from "./CatalogOrderInfoPage";
import { CatalogCategoryPage } from "./CatalogCategoryPage";

const catalogWebPageByRouteKey = {
  [catalogWebRouteKeys.home]: <CatalogWebPage />,
  [catalogWebRouteKeys.productDetail]: <CatalogProductDetailPage />,
  [catalogWebRouteKeys.order]: <CatalogOrderPage />,
  [catalogWebRouteKeys.orderInfo]: <CatalogOrderInfoPage />,
  [catalogWebRouteKeys.category]: <CatalogCategoryPage />,
};

export const catalogWebFeatureRoutes = Object.entries(catalogWebPageByRouteKey).map(([routeKey, element]) => ({
  path: catalogWebRoutesModel[routeKey],
  element,
}));
