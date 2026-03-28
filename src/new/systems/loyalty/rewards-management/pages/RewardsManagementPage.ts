import { RewardService } from "../services/RewardService";

export class RewardsManagementPage {
  constructor(private readonly service: RewardService) {}

  async lookupCoupon(businessId: number, qrCode: string, token: string): Promise<{ id: number; description: string; maxRedemptions: number }> {
    const coupon = await this.service.getCouponByQr(businessId, qrCode, token);

    return {
      id: coupon.id,
      description: coupon.description,
      maxRedemptions: coupon.maxRedemptions,
    };
  }

  async createCoupon(
    businessId: number,
    payload: { qr: string; description: string; maxRedemptions: number },
    token: string,
  ): Promise<{ id: number; qr: string; description: string; maxRedemptions: number }> {
    const coupon = await this.service.createCoupon({
      businessId,
      qr: payload.qr,
      description: payload.description,
      maxRedemptions: payload.maxRedemptions,
    }, token);

    return {
      id: coupon.id,
      qr: coupon.qr,
      description: coupon.description,
      maxRedemptions: coupon.maxRedemptions,
    };
  }
}
