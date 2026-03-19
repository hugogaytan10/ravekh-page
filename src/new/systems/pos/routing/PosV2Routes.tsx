import { Navigate, Route } from "react-router-dom";
import { ProductsV2PosPage } from "../features/products/ui/ProductsV2PosPage";
import { PosHealthV2Screen } from "../features/health/ui/PosHealthV2Screen";

export const POS_V2_ROUTES = (
  <Route path="/v2/pos">
    <Route index element={<Navigate to="products" replace />} />
    <Route path="products" element={<ProductsV2PosPage />} />
    <Route path="health" element={<PosHealthV2Screen />} />
  </Route>
);
