interface CreateCouponPayload {
  Business_Id: number;
  QR: string;
  Description: string;
  Valid: string;
  LimitUsers: number;
}

interface Coupon {
  Branch_Ids?: number[] | null;
  Branch_Names?: string[];
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

interface ClaimCouponPayload {
  Coupon_Id: number;
  User_Id: number;
  Used?: boolean;
  DateUsed?: string;
}

interface Visits {
  Branch_Id?: number | null;
  BranchName?: string | null;
  Id?: number;
  Business_Id: number;
  User_Id: number;
  Date?: Date;
  VisitCount?: number;
  BusinessName?: string;
  MinVisits?: number;
}

export type { ClaimCouponPayload, Coupon, CouponHasUser, CreateCouponPayload, Visits };
