import { Navigate, Route, Routes } from "react-router-dom";
import { LoyaltyCustomerTokenPage } from "./pages/LoyaltyCustomerTokenPage";
import { LoyaltyCustomerVisitsPage } from "./pages/LoyaltyCustomerVisitsPage";
import { LoyaltyCustomerRegisterPage } from "./pages/LoyaltyCustomerRegisterPage";
import { LoyaltyCustomerResetPasswordPage } from "./pages/LoyaltyCustomerResetPasswordPage";
import { LoyaltyCustomerHomePage } from "./pages/LoyaltyCustomerHomePage";
import { LoyaltyCustomerCouponsPage } from "./pages/LoyaltyCustomerCouponsPage";
import { LoyaltyCustomerSettingsPage } from "./pages/LoyaltyCustomerSettingsPage";
import { LoyaltyCustomerDeleteAccountPage } from "./pages/LoyaltyCustomerDeleteAccountPage";
import { LoyaltyCustomerAdminScanPage } from "./pages/LoyaltyCustomerAdminScanPage";
import { LoyaltyCustomerAdminSuccessPage } from "./pages/LoyaltyCustomerAdminSuccessPage";
import { LoyaltyCustomerChangeNamePage } from "./pages/LoyaltyCustomerChangeNamePage";
import { LoyaltyCustomerQrPage } from "./pages/LoyaltyCustomerQrPage";
import { LoyaltyCustomerWebRedeemPage } from "./pages/LoyaltyCustomerWebRedeemPage";
import { LoyaltyCustomerClaimPage } from "./pages/LoyaltyCustomerClaimPage";
import { LoyaltyCustomerCouponsNewPage } from "./pages/LoyaltyCustomerCouponsNewPage";
import { LoyaltyCustomerPvVisitsPage } from "./pages/LoyaltyCustomerPvVisitsPage";
import { LoyaltyCustomerPvCouponsPage } from "./pages/LoyaltyCustomerPvCouponsPage";

/**
 * Clon 1:1 del flujo de fidelidad, reimplementado dentro del módulo moderno.
 */
export const LoyaltyCustomerLegacyCloneRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<Navigate to="cupones" replace />} />

      <Route path="cupones" element={<LoyaltyCustomerTokenPage />} />
      <Route path="cupones/login" element={<LoyaltyCustomerTokenPage />} />
      <Route path="cupones/visitas" element={<LoyaltyCustomerVisitsPage />} />
      <Route path="cupones/registro" element={<LoyaltyCustomerRegisterPage />} />
      <Route path="cupones/reset-password" element={<LoyaltyCustomerResetPasswordPage />} />
      <Route path="cupones/home" element={<LoyaltyCustomerHomePage />} />
      <Route path="cupones/mis-cupones" element={<LoyaltyCustomerCouponsPage />} />
      <Route path="cupones/ajustes" element={<LoyaltyCustomerSettingsPage />} />
      <Route path="cupones/eliminar-cuenta" element={<LoyaltyCustomerDeleteAccountPage />} />
      <Route path="cupones/admin/escanear" element={<LoyaltyCustomerAdminScanPage />} />
      <Route path="cupones/admin/confirmado" element={<LoyaltyCustomerAdminSuccessPage />} />
      <Route path="cupones/cambio-nombre" element={<LoyaltyCustomerChangeNamePage />} />
      <Route path="cupones/qr" element={<LoyaltyCustomerQrPage />} />
      <Route path="cupones/reclamo-web" element={<LoyaltyCustomerWebRedeemPage />} />
      <Route path="cupones/cupones" element={<LoyaltyCustomerCouponsPage />} />
      <Route path="cupones/editar/:CouponId" element={<LoyaltyCustomerCouponsPage />} />
      <Route path="cupones/:couponId" element={<LoyaltyCustomerClaimPage />} />
      <Route path="cupones/nuevo" element={<LoyaltyCustomerCouponsNewPage />} />
      <Route path="visit/redeem" element={<LoyaltyCustomerVisitsPage />} />

      <Route path="cuponespv" element={<Navigate to="cuponespv/visitas" replace />} />
      <Route path="cuponespv/visitas" element={<LoyaltyCustomerPvVisitsPage />} />
      <Route path="cuponespv/visitas/top-clientes" element={<LoyaltyCustomerPvVisitsPage />} />
      <Route path="cuponespv/visitas/totales" element={<LoyaltyCustomerPvVisitsPage />} />
      <Route path="cuponespv/visitas/generar/:mode" element={<LoyaltyCustomerPvVisitsPage />} />
      <Route path="cuponespv/visitas/qr-dinamico" element={<LoyaltyCustomerPvVisitsPage />} />
      <Route path="cuponespv/visitas/qrs-activos/:mode" element={<LoyaltyCustomerPvVisitsPage />} />
      <Route path="cuponespv/cupones" element={<LoyaltyCustomerPvCouponsPage />} />
      <Route path="cuponespv/cupones/crear" element={<LoyaltyCustomerPvCouponsPage />} />
      <Route path="cuponespv/cupones/lista" element={<LoyaltyCustomerPvCouponsPage />} />
      <Route path="cuponespv/cupones/scanear" element={<LoyaltyCustomerAdminScanPage />} />
      <Route path="cuponespv/cupones/editar/:CouponId" element={<LoyaltyCustomerPvCouponsPage />} />
      <Route path="cuponespv/editar/:CouponId" element={<LoyaltyCustomerPvCouponsPage />} />

      <Route path="*" element={<Navigate to="cupones" replace />} />
    </Routes>
  );
};
