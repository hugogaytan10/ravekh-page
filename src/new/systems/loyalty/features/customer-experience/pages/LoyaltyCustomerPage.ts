import type {
  LoyaltyCustomerCoupon,
  LoyaltyCustomerProfile,
  LoyaltyVisitProgress,
  RedeemVisitTokenResult,
} from "../model/LoyaltyCustomer";
import { LoyaltyCustomerService } from "../services/LoyaltyCustomerService";

export class LoyaltyCustomerPage {
  constructor(private readonly service: LoyaltyCustomerService) {}

  async validateToken(token: string): Promise<LoyaltyCustomerProfile> {
    if (!token.trim()) {
      throw new Error("Ingresa un token válido.");
    }
    return this.service.validateCustomerToken(token.trim());
  }

  async loadProgress(customerId: number): Promise<LoyaltyVisitProgress> {
    return this.service.getVisitProgress(customerId);
  }

  async loadCoupons(customerId: number): Promise<LoyaltyCustomerCoupon[]> {
    return this.service.listCustomerCoupons(customerId);
  }

  async redeemVisit(token: string, customerId: number): Promise<RedeemVisitTokenResult> {
    if (!token.trim()) {
      throw new Error("El token de visita es obligatorio.");
    }
    return this.service.redeemVisitToken(token.trim(), customerId);
  }

  async redeemCoupon(couponId: number, customerId: number): Promise<void> {
    return this.service.redeemCoupon(couponId, customerId);
  }
}
