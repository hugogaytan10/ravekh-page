import { Navigate, Route, Routes } from "react-router-dom";
import { ChangeName } from "../../coupons/pages/ChangeName";
import { CouponClaimPage } from "../../coupons/pages/CouponClaimPage";
import { CouponCongratsPage } from "../../coupons/pages/CouponCongratsPage";
import { CouponQrPage } from "../../coupons/pages/CouponQrPage";
import { CouponWebRedeemPage } from "../../coupons/pages/CouponWebRedeemPage";
import { CouponsPage } from "../../coupons/pages/CouponsPage";
import { DeleteAccountPage } from "../../coupons/pages/DeleteAccountPage";
import { HomePage } from "../../coupons/pages/HomePage";
import { LoginPage } from "../../coupons/pages/LoginPage";
import { MyCouponsPage } from "../../coupons/pages/MyCouponsPage";
import { RegisterPage } from "../../coupons/pages/RegisterPage";
import RecoverPasswordPage from "../../coupons/pages/ResetPasswordPage";
import { ScanPage } from "../../coupons/pages/ScanPage";
import { SettingsPage } from "../../coupons/pages/SettingsPage";
import { SuccessPage } from "../../coupons/pages/SuccessPage";
import { VisitHistoryPage } from "../../coupons/pages/VisitHistoryPage";
import { VisitRedeemPage } from "../../coupons/pages/VisitRedeemPage";

export const LoyaltyCustomerLegacyCloneRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<Navigate to="cupones" replace />} />
      <Route path="cupones" element={<LoginPage />} />
      <Route path="cupones/visitas" element={<VisitHistoryPage />} />
      <Route path="cupones/registro" element={<RegisterPage />} />
      <Route path="cupones/reset-password" element={<RecoverPasswordPage />} />
      <Route path="cupones/home" element={<HomePage />} />
      <Route path="cupones/mis-cupones" element={<MyCouponsPage />} />
      <Route path="cupones/ajustes" element={<SettingsPage />} />
      <Route path="cupones/eliminar-cuenta" element={<DeleteAccountPage />} />
      <Route path="cupones/admin/escanear" element={<ScanPage />} />
      <Route path="cupones/admin/confirmado" element={<SuccessPage />} />
      <Route path="visit/redeem" element={<VisitRedeemPage />} />
      <Route path="cupones/cambio-nombre" element={<ChangeName />} />
      <Route path="cupones/qr" element={<CouponQrPage />} />
      <Route path="cupones/reclamo-web" element={<CouponWebRedeemPage />} />
      <Route path="cupones/cupones" element={<CouponsPage />} />
      <Route path="cupones/nuevo" element={<CouponCongratsPage />} />
      <Route path="cupones/:couponId" element={<CouponClaimPage />} />
      <Route path="*" element={<Navigate to="cupones" replace />} />
    </Routes>
  );
};
