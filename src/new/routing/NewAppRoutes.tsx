import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
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
import { MainCatalogPage } from "../systems/main-catalog/pages/MainCatalogPage";
import { RavekhPerfumeriaPage } from "../systems/ravekh-perfumeria/pages/RavekhPerfumeriaPage";
import { RavekhBoutiquePage } from "../systems/ravekh-perfumeria/pages/RavekhBoutique";
import { RavekhRefaccionesPage } from "../systems/ravekh-perfumeria/pages/RavekhRefacciones";
import { RavekhAbarrotesPage } from "../systems/ravekh-perfumeria/pages/ravekhAbarrotesPage";
import { RavekhAccesoriosPage } from "../systems/ravekh-perfumeria/pages/RavekhAccesoriosPage";
import { RavekhComidaPage } from "../systems/ravekh-perfumeria/pages/RavekhComidaPage";
const LegacyCatalogRedirect = () => {
  const { idBusiness } = useParams<{ idBusiness: string }>();
  return <Navigate to={`/v2/catalogo/${idBusiness ?? ""}`} replace />;
};

const V2ProductRedirect = () => {
  const { productId, phone } = useParams<{ productId: string; phone: string }>();
  return <Navigate to={`/catalogo/producto/${productId ?? ""}/${phone ?? ""}`} replace />;
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

const RouteSeo = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const canonicalUrl = typeof window !== "undefined" ? `${window.location.origin}${pathname}` : pathname;
  const previewImage = typeof window !== "undefined" ? `${window.location.origin}/ravekh.png` : "/ravekh.png";

  const routeSeo = (() => {
    if (pathname === "/") {
      return {
        title: "Ravekh | Desarrollo de software, POS y fidelización",
        description: "Creamos software a la medida: punto de venta (POS), fidelización de clientes y soluciones web para escalar tu negocio.",
        robots: "index,follow,max-image-preview:large",
      };
    }

    if (pathname === "/maincatalogo") {
      return {
        title: "Catálogo digital para vender por WhatsApp | Ravekh",
        description: "Crea un catálogo digital profesional para organizar productos, compartir un link y vender por WhatsApp con menos fricción.",
        robots: "index,follow,max-image-preview:large",
      };
    }

    if (pathname === "/RavekhPerfumeria") {
      return {
        title: "Ravekh Perfumería | Catálogo digital para perfumerías",
        description: "Presenta tus fragancias en un catálogo elegante, comparte un link y recibe pedidos claros por WhatsApp.",
        robots: "index,follow,max-image-preview:large",
      };
    }

    if (pathname === "/RavekhBoutique" || pathname === "/ravekhBoutique") {
      return {
        title: "Ravekh Boutique | Catálogo digital para boutiques",
        description: "Presenta tus productos en un catálogo elegante, comparte un link y recibe pedidos claros por WhatsApp.",
        robots: "index,follow,max-image-preview:large",
      };
    }

    if (pathname === "/RavekhRefacciones") {
      return {
        title: "Ravekh Refacciones | Catálogo digital para refacciones",
        description: "Presenta tus productos en un catálogo elegante, comparte un link y recibe pedidos claros por WhatsApp.",
        robots: "index,follow,max-image-preview:large",
      };
    }


    if (pathname.startsWith("/v2/catalogo") || pathname.startsWith("/catalogo")) {
      return {
        title: "Catálogo digital | Ravekh",
        description: "Explora productos, revisa detalles y realiza pedidos desde el catálogo digital de Ravekh.",
        robots: "index,follow,max-image-preview:large",
      };
    }

    if (pathname.startsWith("/politicas")) {
      return {
        title: "Políticas de privacidad | Ravekh",
        description: "Consulta las políticas de privacidad y tratamiento de datos publicadas por Ravekh.",
        robots: "index,follow",
      };
    }

    if (pathname.startsWith("/pos") || pathname.startsWith("/v2/pos") || pathname.startsWith("/coupons")) {
      return {
        title: "Ravekh App",
        description: "Aplicación de operación interna de Ravekh.",
        robots: "noindex,nofollow",
      };
    }

    return {
      title: "Ravekh",
      description: "Soluciones tecnológicas para tu negocio.",
      robots: "index,follow",
    };
  })();

  return (
    <Helmet>
      <title>{routeSeo.title}</title>
      <meta name="description" content={routeSeo.description} />
      <meta name="robots" content={routeSeo.robots} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={routeSeo.title} />
      <meta property="og:description" content={routeSeo.description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={previewImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={routeSeo.title} />
      <meta name="twitter:description" content={routeSeo.description} />
      <meta name="twitter:image" content={previewImage} />
    </Helmet>
  );
};

export const NewAppRoutes = () => {
  return (
    <HelmetProvider>
      <RouteSeo />
      <Routes>
        <Route path="/" element={<LandingPageRavekhPage />} />
        <Route path="/maincatalogo" element={<MainCatalogPage />} />
        <Route path="/RavekhBoutique" element={<RavekhBoutiquePage />} />
        <Route path="/ravekhBoutique" element={<RavekhBoutiquePage />} />
        <Route path="/RavekhPerfumeria" element={<RavekhPerfumeriaPage />} />
        <Route path="/RavekhRefacciones" element={<RavekhRefaccionesPage />} />
        <Route path="/RavekhAbarrotes" element={<RavekhAbarrotesPage />} />
        <Route path="/RavekhAccesorios" element={<RavekhAccesoriosPage />} />
        <Route path="/RavekhComida" element={<RavekhComidaPage />} />
      {/* Catálogo v2 moderno y desacoplado */}
        <Route path="/v2/catalogo/:Id" element={<CatalogStorefrontPage />} />
        <Route path="/catalogo/producto/:productId/:phone" element={<CatalogProductDetailPage />} />
        <Route path="/catalogo/pedido" element={<CatalogCartPage />} />
        <Route path="/catalogo/pedido-info" element={<CatalogOrderInfoPage />} />
        <Route path="/coupons/*" element={<LoyaltyCustomerRoutes />} />
        <Route path="/politicas" element={<PrivacyPoliciesIndexPage />} />
        <Route path="/politicas/:policySlug" element={<PrivacyPolicyPage />} />

      {/* Compatibilidad de URLs antiguas sin dependencias a módulos legacy */}
        <Route path="/catalogo/:idBusiness" element={<LegacyCatalogRedirect />} />
        <Route path="/v2/catalogo/producto/:productId/:phone" element={<V2ProductRedirect />} />
        <Route path="/v2/catalogo/pedido" element={<Navigate to="/catalogo/pedido" replace />} />
        <Route path="/v2/catalogo/pedido-info" element={<Navigate to="/catalogo/pedido-info" replace />} />
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
    </HelmetProvider>
  );
};
