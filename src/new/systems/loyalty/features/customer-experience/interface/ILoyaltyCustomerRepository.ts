import type {
  LoyaltyCustomerCoupon,
  LoyaltyCustomerProfile,
  LoyaltyVisitProgress,
  RedeemVisitTokenPayload,
  RedeemVisitTokenResult,
} from "../model/LoyaltyCustomer";

export interface ILoyaltyCustomerRepository {
  validateCustomerToken(token: string): Promise<LoyaltyCustomerProfile>;
  getVisitProgress(customerId: number): Promise<LoyaltyVisitProgress>;
  listCustomerCoupons(customerId: number): Promise<LoyaltyCustomerCoupon[]>;
  redeemVisitToken(payload: RedeemVisitTokenPayload): Promise<RedeemVisitTokenResult>;
  redeemCoupon(couponId: number, customerId: number): Promise<void>;
}
