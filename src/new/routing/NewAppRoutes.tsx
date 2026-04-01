import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { LandingPageRavekhPage } from "../systems/landing-ravekh/pages/LandingRavekhPage";
import { CatalogStorefrontPage } from "../systems/catalog/storefront/ui/CatalogStorefrontPage";
import { CatalogProductDetailPage } from "../systems/catalog/storefront/ui/CatalogProductDetailPage";
import { CatalogCartPage } from "../systems/catalog/storefront/ui/CatalogCartPage";
import { CatalogOrderInfoPage } from "../systems/catalog/storefront/ui/CatalogOrderInfoPage";
import { PosModeEntryPage } from "../systems/pos/routing/PosModeEntryPage";
import { POS_V2_ROUTES } from "../systems/pos/routing/PosV2Routes";
import { LoyaltyCustomerRoutes } from "../systems/loyalty/features/customer-experience/ui/LoyaltyCustomerRoutes";
import { LoyaltyCustomerLegacyCloneRoutes } from "../systems/loyalty/features/customer-experience/ui/LoyaltyCustomerLegacyCloneRoutes";

const LegacyCatalogRedirect = () => {
  const { idBusiness } = useParams<{ idBusiness: string }>();
  return <Navigate to={`/v2/catalogo/${idBusiness ?? ""}`} replace />;
};

const LegacyProductRedirect = () => {
  const { idProducto, telefono } = useParams<{ idProducto: string; telefono: string }>();
  return <Navigate to={`/v2/catalogo/producto/${idProducto ?? ""}/${telefono ?? ""}`} replace />;
};

const LegacyCategoryRedirect = () => {
  const { idCategoria } = useParams<{ idCategoria: string }>();
  const search = idCategoria ? `?category=${encodeURIComponent(idCategoria)}` : "";
  return <Navigate to={`/v2/catalogo/0${search}`} replace />;
};

const LoyaltyClonePathRedirect = () => {
  const location = useLocation();
  const normalizedPath = location.pathname.replace(/^\/+/, "");
  return <Navigate to={`/v2/loyalty/clone/${normalizedPath}${location.search}`} replace />;
};

export const NewAppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPageRavekhPage />} />

      {/* Catálogo v2 moderno y desacoplado */}
      <Route path="/v2/catalogo/:businessId" element={<CatalogStorefrontPage />} />
      <Route path="/v2/catalogo/producto/:productId/:phone" element={<CatalogProductDetailPage />} />
      <Route path="/v2/catalogo/pedido" element={<CatalogCartPage />} />
      <Route path="/v2/catalogo/pedido-info" element={<CatalogOrderInfoPage />} />
      <Route path="/v2/loyalty/customer/*" element={<LoyaltyCustomerRoutes />} />
      <Route path="/v2/loyalty/clone/*" element={<LoyaltyCustomerLegacyCloneRoutes />} />

      {/* Compatibilidad de URLs antiguas sin dependencias a módulos legacy */}
      <Route path="/catalogo/:idBusiness" element={<LegacyCatalogRedirect />} />
      <Route path="/catalogo/producto/:idProducto/:telefono" element={<LegacyProductRedirect />} />
      <Route path="/catalogo/pedido" element={<Navigate to="/v2/catalogo/pedido" replace />} />
      <Route path="/catalogo/pedido-info" element={<Navigate to="/v2/catalogo/pedido-info" replace />} />
      <Route path="/categoria/:idCategoria" element={<LegacyCategoryRedirect />} />
      <Route path="/cupones/*" element={<LoyaltyClonePathRedirect />} />
      <Route path="/cuponespv/*" element={<LoyaltyClonePathRedirect />} />
      <Route path="/visit/redeem" element={<LoyaltyClonePathRedirect />} />

      <Route path="/pos" element={<PosModeEntryPage />} />
      {POS_V2_ROUTES}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
