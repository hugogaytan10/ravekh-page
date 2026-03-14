import { couponsRouteKeys, couponsRoutesModel } from "../../coupons";

const {
  systemEntry,
  login,
  register,
  home,
  myCoupons,
  settings,
  deleteAccount,
  adminScan,
  adminConfirmed,
  visitRedeem,
  changeName,
  qr,
  coupons,
  claimCoupon,
  congrats,
  visitHistory,
  editCouponApp,
  editCouponPv,
  pvRoot,
} = couponsRoutesModel;

export const couponVisitsRoutesModel = {
  customer: {
    systemEntry,
    login,
    register,
    home,
    myCoupons,
    settings,
    deleteAccount,
    adminScan,
    adminConfirmed,
    visitRedeem,
    changeName,
    qr,
    coupons,
    claimCoupon,
    congrats,
    visitHistory,
    editCouponApp,
  },
  backoffice: {
    pvRoot,
    editCouponPv,
  },
};

export const couponVisitsRouteKeys = couponsRouteKeys;
