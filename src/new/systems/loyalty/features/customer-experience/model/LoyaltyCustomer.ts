export type LoyaltyCustomerProfile = {
  id: number;
  name: string;
  email?: string;
};

export type LoyaltyVisitProgress = {
  customerId: number;
  customerName: string;
  totalVisits: number;
  visitsRequired: number;
  remainingVisits: number;
  completionRatio: number;
};

export type LoyaltyCustomerCoupon = {
  id: number;
  description: string;
  qr: string;
  isRedeemed: boolean;
  expiresAt?: string;
};

export type RedeemVisitTokenPayload = {
  token: string;
  customerId: number;
};

export type RedeemVisitTokenResult = {
  visitCreated: boolean;
  couponGenerated: boolean;
  message: string;
};
