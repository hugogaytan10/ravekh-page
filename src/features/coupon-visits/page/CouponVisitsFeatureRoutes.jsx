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
import { couponVisitsRouteKeys, couponVisitsRoutesModel } from "../model/couponVisitsRoutes";

const customerRoutes = couponVisitsRoutesModel.customer;
const backofficeRoutes = couponVisitsRoutesModel.backoffice;

const couponVisitsPageByRouteKey = {
  [couponVisitsRouteKeys.login]: <LoginPage />,
  [couponVisitsRouteKeys.register]: <RegisterPage />,
  [couponVisitsRouteKeys.home]: <HomePage />,
  [couponVisitsRouteKeys.myCoupons]: <MyCouponsPage />,
  [couponVisitsRouteKeys.settings]: <SettingsPage />,
  [couponVisitsRouteKeys.deleteAccount]: <DeleteAccountPage />,
  [couponVisitsRouteKeys.adminScan]: <ScanPage />,
  [couponVisitsRouteKeys.adminConfirmed]: <SuccessPage />,
  [couponVisitsRouteKeys.visitRedeem]: <VisitRedeemPage />,
  [couponVisitsRouteKeys.changeName]: <ChangeName />,
  [couponVisitsRouteKeys.qr]: <CouponQrPage />,
  [couponVisitsRouteKeys.coupons]: <CouponsPage />,
  [couponVisitsRouteKeys.claimCoupon]: <CouponClaimPage />,
  [couponVisitsRouteKeys.congrats]: <CouponCongratsPage />,
  [couponVisitsRouteKeys.visitHistory]: <VisitHistoryPage />,
  [couponVisitsRouteKeys.editCouponPv]: <CuponesEdit />,
  [couponVisitsRouteKeys.editCouponApp]: <CuponesEdit />,
};

const routePathByKey = {
  ...customerRoutes,
  ...backofficeRoutes,
};

export const couponVisitsFeatureRoutes = [
  {
    path: customerRoutes.systemEntry,
    element: <Navigate to={customerRoutes.login} replace />,
  },
  {
    path: backofficeRoutes.pvRoot,
    element: <MainCoupons />,
    children: [
      { index: true, element: <Navigate to="visitas" replace /> },
      { path: "visitas/*", element: <VisitsNavigator /> },
      { path: "cupones/*", element: <CouponsNavigator /> },
      { path: "editar/:CouponId", element: <CuponesEdit /> },
    ],
  },
  ...Object.entries(couponVisitsPageByRouteKey).map(([routeKey, element]) => ({
    path: routePathByKey[routeKey],
    element,
  })),
];
