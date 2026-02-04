interface CreateCouponPayload {
  Business_Id: number;
  QR: string;
  Description: string;
  Valid: string;
  LimitUsers: number;
}

interface Coupon {
  Id: number;
  Business_Id: number;
  QR: string;
  Description: string;
  Valid: string;
  LimitUsers: number;
}

interface CouponHasUser {
  Id: number;
  Coupon_Id: number;
  User_Id: number;
  Used: boolean;
  DateUsed: string;
}

export type { Coupon, CouponHasUser, CreateCouponPayload };
