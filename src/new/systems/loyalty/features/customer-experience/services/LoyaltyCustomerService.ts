import type { ILoyaltyCustomerRepository } from "../interface/ILoyaltyCustomerRepository";
import type {
  LoyaltyCustomerCoupon,
  LoyaltyCustomerProfile,
  LoyaltyVisitProgress,
  RedeemVisitTokenResult,
} from "../model/LoyaltyCustomer";

export class LoyaltyCustomerService {
  constructor(private readonly repository: ILoyaltyCustomerRepository) {}

  validateCustomerToken(token: string): Promise<LoyaltyCustomerProfile> {
    return this.repository.validateCustomerToken(token);
  }

  getVisitProgress(customerId: number): Promise<LoyaltyVisitProgress> {
    return this.repository.getVisitProgress(customerId);
  }

  listCustomerCoupons(customerId: number): Promise<LoyaltyCustomerCoupon[]> {
    return this.repository.listCustomerCoupons(customerId);
  }

  redeemVisitToken(token: string, customerId: number): Promise<RedeemVisitTokenResult> {
    return this.repository.redeemVisitToken({ token, customerId });
  }

  redeemCoupon(couponId: number, customerId: number): Promise<void> {
    return this.repository.redeemCoupon(couponId, customerId);
  }
}
