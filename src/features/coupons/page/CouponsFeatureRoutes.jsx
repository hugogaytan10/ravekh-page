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
import { VisitHistoryPage } from "../../../coupons/pages/VisitHistoryPage";
import { CouponQrPage } from "../../../coupons/pages/CouponQrPage";
import { CouponCongratsPage } from "../../../coupons/pages/CouponCongratsPage";
import { CouponClaimPage } from "../../../coupons/pages/CouponClaimPage";
import { CouponsPage } from "../../../coupons/pages/CouponsPage";
import { couponsRouteKeys, couponsRoutesModel } from "../model/couponsRoutes";

const couponsPageByRouteKey = {
  [couponsRouteKeys.login]: <LoginPage />,
  [couponsRouteKeys.register]: <RegisterPage />,
  [couponsRouteKeys.home]: <HomePage />,
  [couponsRouteKeys.myCoupons]: <MyCouponsPage />,
  [couponsRouteKeys.settings]: <SettingsPage />,
  [couponsRouteKeys.deleteAccount]: <DeleteAccountPage />,
  [couponsRouteKeys.adminScan]: <ScanPage />,
  [couponsRouteKeys.adminConfirmed]: <SuccessPage />,
  [couponsRouteKeys.visitRedeem]: <VisitRedeemPage />,
  [couponsRouteKeys.changeName]: <ChangeName />,
  [couponsRouteKeys.qr]: <CouponQrPage />,
  [couponsRouteKeys.coupons]: <CouponsPage />,
  [couponsRouteKeys.claimCoupon]: <CouponClaimPage />,
  [couponsRouteKeys.congrats]: <CouponCongratsPage />,
  [couponsRouteKeys.visitHistory]: <VisitHistoryPage />,
  [couponsRouteKeys.editCouponPv]: <CuponesEdit />,
  [couponsRouteKeys.editCouponApp]: <CuponesEdit />,
};

export const couponsFeatureRoutes = [
  {
    path: couponsRoutesModel.systemEntry,
    element: <Navigate to={couponsRoutesModel.login} replace />,
  },
  {
    path: couponsRoutesModel.pvRoot,
    element: <MainCoupons />,
    children: [
      { index: true, element: <Navigate to="visitas" replace /> },
      { path: "visitas/*", element: <VisitsNavigator /> },
      { path: "cupones/*", element: <CouponsNavigator /> },
      { path: "editar/:CouponId", element: <CuponesEdit /> },
    ],
  },
  ...Object.entries(couponsPageByRouteKey).map(([routeKey, element]) => ({
    path: couponsRoutesModel[routeKey],
    element,
  })),
];
