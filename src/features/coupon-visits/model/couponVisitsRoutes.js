import { couponsRoutesModel } from "../../coupons";

export const couponVisitsRoutesModel = {
  customer: {
    systemEntry: couponsRoutesModel.systemEntry,
    login: couponsRoutesModel.login,
    register: couponsRoutesModel.register,
    home: couponsRoutesModel.home,
    myCoupons: couponsRoutesModel.myCoupons,
    settings: couponsRoutesModel.settings,
    deleteAccount: couponsRoutesModel.deleteAccount,
    scan: couponsRoutesModel.adminScan,
    success: couponsRoutesModel.adminConfirmed,
    redeemVisit: couponsRoutesModel.visitRedeem,
    changeName: couponsRoutesModel.changeName,
    qr: couponsRoutesModel.qr,
    coupons: couponsRoutesModel.coupons,
    claim: couponsRoutesModel.claimCoupon,
    congrats: couponsRoutesModel.congrats,
    visits: couponsRoutesModel.visitHistory,
    editCoupon: couponsRoutesModel.editCouponApp,
  },
  backoffice: {
    root: couponsRoutesModel.pvRoot,
    editCoupon: couponsRoutesModel.editCouponPv,
  },
};
