export const couponVisitsRoutesModel = {
  customer: {
    systemEntry: "/sistema/cupones",
    login: "/cupones",
    register: "/cupones/registro",
    home: "/cupones/home",
    myCoupons: "/cupones/mis-cupones",
    settings: "/cupones/ajustes",
    deleteAccount: "/cupones/eliminar-cuenta",
    scan: "/cupones/admin/escanear",
    success: "/cupones/admin/confirmado",
    redeemVisit: "/visit/redeem",
    changeName: "/cupones/cambio-nombre",
    qr: "/cupones/qr",
    coupons: "/cupones/cupones",
    claim: "/cupones/:couponId",
    congrats: "/cupones/nuevo",
    visits: "/cupones/visitas",
  },
  backoffice: {
    root: "/cuponespv",
    editCoupon: "/cuponespv/editar/:CouponId",
  },
};
