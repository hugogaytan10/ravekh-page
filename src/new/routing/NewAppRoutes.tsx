import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { LandingPageRavekhPage } from "../systems/landing-ravekh/pages/LandingRavekhPage";
import { CatalogStorefrontPage } from "../systems/catalog/storefront/ui/CatalogStorefrontPage";
import { CatalogProductDetailPage } from "../systems/catalog/storefront/ui/CatalogProductDetailPage";
import { CatalogCartPage } from "../systems/catalog/storefront/ui/CatalogCartPage";
import { CatalogOrderInfoPage } from "../systems/catalog/storefront/ui/CatalogOrderInfoPage";
import { PosModeEntryPage } from "../systems/pos/routing/PosModeEntryPage";
import { POS_V2_ROUTES } from "../systems/pos/routing/PosV2Routes";
import { LoyaltyCustomerRoutes } from "../systems/loyalty/features/customer-experience/ui/LoyaltyCustomerRoutes";
import { PrivacyPoliciesIndexPage } from "../systems/legal/pages/PrivacyPoliciesIndexPage";
import { PrivacyPolicyPage } from "../systems/legal/pages/PrivacyPolicyPage";

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

const LEGACY_LOYALTY_PATH_SEGMENTS: Array<[string, string]> = [
  ["cupones", "coupons"],
  ["visitas", "visits"],
  ["registro", "register"],
  ["mis-cupones", "my-coupons"],
  ["ajustes", "settings"],
  ["eliminar-cuenta", "delete-account"],
  ["cambio-nombre", "change-name"],
  ["reclamo-web", "web-claim"],
  ["nuevo", "new"],
  ["escanear", "scan"],
  ["confirmado", "success"],
];

const normalizeLegacyLoyaltyPath = (rawPath: string): string => {
  let normalized = rawPath;

  normalized = normalized.replace(/^\/?v2\/loyalty\/(customer|clone)\/?/i, "");
  normalized = normalized.replace(/^\/?cuponespv\/?/i, "");
  normalized = normalized.replace(/^\/?cupones\/?/i, "");
  normalized = normalized.replace(/^\/?visit\/redeem\/?/i, "visits/redeem");

  for (const [from, to] of LEGACY_LOYALTY_PATH_SEGMENTS) {
    const expression = new RegExp(`(^|/)${from}(?=/|$)`, "gi");
    normalized = normalized.replace(expression, `$1${to}`);
  }

  normalized = normalized.replace(/^\/+/, "");
  return normalized;
};

const LoyaltyLegacyRedirect = () => {
  const location = useLocation();
  const translatedPath = normalizeLegacyLoyaltyPath(location.pathname);
  const targetPath = translatedPath.length > 0 ? `/coupons/${translatedPath}` : "/coupons";
  return <Navigate to={`${targetPath}${location.search}`} replace />;
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
      <Route path="/coupons/*" element={<LoyaltyCustomerRoutes />} />
      <Route path="/politicas" element={<PrivacyPoliciesIndexPage />} />
      <Route path="/politicas/:policySlug" element={<PrivacyPolicyPage />} />

      {/* Compatibilidad de URLs antiguas sin dependencias a módulos legacy */}
      <Route path="/catalogo/:idBusiness" element={<LegacyCatalogRedirect />} />
      <Route path="/catalogo/producto/:idProducto/:telefono" element={<LegacyProductRedirect />} />
      <Route path="/catalogo/pedido" element={<Navigate to="/v2/catalogo/pedido" replace />} />
      <Route path="/catalogo/pedido-info" element={<Navigate to="/v2/catalogo/pedido-info" replace />} />
      <Route path="/categoria/:idCategoria" element={<LegacyCategoryRedirect />} />
      <Route path="/v2/loyalty/customer/*" element={<LoyaltyLegacyRedirect />} />
      <Route path="/v2/loyalty/clone/*" element={<LoyaltyLegacyRedirect />} />
      <Route path="/cupones/*" element={<LoyaltyLegacyRedirect />} />
      <Route path="/cuponespv/*" element={<LoyaltyLegacyRedirect />} />
      <Route path="/visit/redeem" element={<LoyaltyLegacyRedirect />} />

      <Route path="/pos" element={<PosModeEntryPage />} />
      {POS_V2_ROUTES}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
