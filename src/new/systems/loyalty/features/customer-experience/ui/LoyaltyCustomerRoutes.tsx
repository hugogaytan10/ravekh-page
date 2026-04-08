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

export const LoyaltyCustomerRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<LoginPage />} />
      <Route path="visits" element={<VisitHistoryPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="reset-password" element={<RecoverPasswordPage />} />
      <Route path="home" element={<HomePage />} />
      <Route path="my-coupons" element={<MyCouponsPage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="delete-account" element={<DeleteAccountPage />} />
      <Route path="admin" element={<ScanPage />} />
      <Route path="admin/scan" element={<ScanPage />} />
      <Route path="admin/success" element={<SuccessPage />} />
      <Route path="change-name" element={<ChangeName />} />
      <Route path="qr" element={<CouponQrPage />} />
      <Route path="web-claim" element={<CouponWebRedeemPage />} />
      <Route path="coupons" element={<CouponsPage />} />
      <Route path="new" element={<CouponCongratsPage />} />
      <Route path="visits/redeem" element={<VisitRedeemPage />} />
      <Route path=":couponId" element={<CouponClaimPage />} />
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  );
};
