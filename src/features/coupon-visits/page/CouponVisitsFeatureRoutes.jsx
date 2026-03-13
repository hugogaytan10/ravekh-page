import { Navigate } from "react-router-dom";
import { MainCoupons, VisitsNavigator, CouponsNavigator } from "../../../Components/CatalogoWeb/Cupones";
import CuponesEdit from "../../../Components/CatalogoWeb/Cupones/screens/CuponesEdit";
import { LoginPage } from "../../../coupons/pages/LoginPage";
import { RegisterPage } from "../../../coupons/pages/RegisterPage";
import { HomePage } from "../../../coupons/pages/HomePage";
import { MyCouponsPage } from "../../../coupons/pages/MyCouponsPage";
import { SettingsPage } from "../../../coupons/pages/SettingsPage";
import { ScanPage } from "../../../coupons/pages/ScanPage";
import { SuccessPage } from "../../../coupons/pages/SuccessPage";
import { ChangeName } from "../../../coupons/pages/ChangeName";
import { DeleteAccountPage } from "../../../coupons/pages/DeleteAccountPage";
import { VisitRedeemPage } from "../../../coupons/pages/VisitRedeemPage";
import { CouponQrPage } from "../../../coupons/pages/CouponQrPage";
import { CouponCongratsPage } from "../../../coupons/pages/CouponCongratsPage";
import { CouponClaimPage } from "../../../coupons/pages/CouponClaimPage";
import { CouponsPage } from "../../../coupons/pages/CouponsPage";
import { VisitHistoryPage } from "../../../coupons/pages/VisitHistoryPage";

export const couponVisitsFeatureRoutes = [
  { path: "/sistema/cupones", element: <Navigate to="/cupones" replace /> },
  { path: "/cupones", element: <LoginPage /> },
  { path: "/cupones/registro", element: <RegisterPage /> },
  { path: "/cupones/home", element: <HomePage /> },
  { path: "/cupones/mis-cupones", element: <MyCouponsPage /> },
  { path: "/cupones/ajustes", element: <SettingsPage /> },
  { path: "/cupones/eliminar-cuenta", element: <DeleteAccountPage /> },
  { path: "/cupones/admin/escanear", element: <ScanPage /> },
  { path: "/cupones/admin/confirmado", element: <SuccessPage /> },
  { path: "/visit/redeem", element: <VisitRedeemPage /> },
  { path: "/cupones/cambio-nombre", element: <ChangeName /> },
  { path: "/cupones/qr", element: <CouponQrPage /> },
  { path: "/cupones/cupones", element: <CouponsPage /> },
  { path: "/cupones/:couponId", element: <CouponClaimPage /> },
  { path: "/cupones/nuevo", element: <CouponCongratsPage /> },
  { path: "/cupones/visitas", element: <VisitHistoryPage /> },
  {
    path: "/cuponespv",
    element: <MainCoupons />,
    children: [
      { index: true, element: <Navigate to="visitas" replace /> },
      { path: "visitas/*", element: <VisitsNavigator /> },
      { path: "cupones/*", element: <CouponsNavigator /> },
      { path: "editar/:CouponId", element: <CuponesEdit /> },
    ],
  },
  { path: "/cuponespv/editar/:CouponId", element: <CuponesEdit /> },
  { path: "/cupones/editar/:CouponId", element: <CuponesEdit /> },
];
