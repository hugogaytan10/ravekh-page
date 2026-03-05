export type Coupon = {
  Id?: number;
  id?: number;
  couponId?: number;
  Business_Id: number;
  QR: string;
  Description: string;
  LimitUsers: number;
  TotalUsers?: number;
  Valid?: string;
};


export type Visit = {
  Id?: number;
  Business_Id: number;
  User_Id: number;
  UserName?: string;
  Date?: string | Date;
  VisitCount?: number;
  BusinessName?: string;
  MinVisits?: number;
  TotalVisits?: number;
};
