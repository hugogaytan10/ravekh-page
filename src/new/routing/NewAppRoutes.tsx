import { Navigate, Route, Routes } from "react-router-dom";
import { MainCatalogo } from "../../Components/CatalogoWeb/MainCatalogo";
import { DetalleProducto } from "../../Components/CatalogoWeb/DetalleProducto";
import { Pedido } from "../../Components/CatalogoWeb/Pedido";
import { MainCategoria } from "../../Components/CatalogoWeb/Categoria";
import { LandingPageRavekhPage } from "../systems/landing-ravekh/pages/LandingRavekhPage";
import { CatalogStorefrontPage } from "../systems/catalog/storefront/ui/CatalogStorefrontPage";
import { CatalogProductDetailPage } from "../systems/catalog/storefront/ui/CatalogProductDetailPage";
import { CatalogCartPage } from "../systems/catalog/storefront/ui/CatalogCartPage";
import { CatalogOrderInfoPage } from "../systems/catalog/storefront/ui/CatalogOrderInfoPage";
import { PosModeEntryPage } from "../systems/pos/routing/PosModeEntryPage";
import { POS_V2_ROUTES } from "../systems/pos/routing/PosV2Routes";

export const NewAppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPageRavekhPage />} />

      {/* Catálogo v2 moderno y desacoplado */}
      <Route path="/v2/catalogo/:businessId" element={<CatalogStorefrontPage />} />
      <Route path="/v2/catalogo/producto/:productId/:phone" element={<CatalogProductDetailPage />} />
      <Route path="/v2/catalogo/pedido" element={<CatalogCartPage />} />
      <Route path="/v2/catalogo/pedido-info" element={<CatalogOrderInfoPage />} />

      {/* Flujo legacy original */}
      <Route path="/catalogo/:idBusiness" element={<MainCatalogo />} />
      <Route path="/catalogo/producto/:idProducto/:telefono" element={<DetalleProducto />} />
      <Route path="/catalogo/pedido" element={<Pedido view="cart" />} />
      <Route path="/catalogo/pedido-info" element={<Pedido view="info" />} />
      <Route path="/categoria/:idCategoria" element={<MainCategoria />} />

      <Route path="/pos" element={<PosModeEntryPage />} />
      {POS_V2_ROUTES}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
