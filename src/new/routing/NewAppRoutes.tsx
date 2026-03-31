import { Navigate, Route, Routes } from "react-router-dom";
import { LandingPageRavekhPage } from "../systems/landing-ravekh/pages/LandingRavekhPage";
import { CatalogProductDetailPage } from "../systems/catalog/storefront/ui/CatalogProductDetailPage";
import { CatalogStorefrontPage } from "../systems/catalog/storefront/ui/CatalogStorefrontPage";
import { PosModeEntryPage } from "../systems/pos/routing/PosModeEntryPage";
import { POS_V2_ROUTES } from "../systems/pos/routing/PosV2Routes";

export const NewAppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPageRavekhPage />} />
      <Route path="/v2/catalogo/:businessId" element={<CatalogStorefrontPage />} />
      <Route path="/catalogo/:businessId" element={<CatalogStorefrontPage />} />
      <Route path="/v2/catalogo/producto/:productId/:phone" element={<CatalogProductDetailPage />} />
      <Route path="/catalogo/producto/:productId/:phone" element={<CatalogProductDetailPage />} />
      <Route path="/pos" element={<PosModeEntryPage />} />
      {POS_V2_ROUTES}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
