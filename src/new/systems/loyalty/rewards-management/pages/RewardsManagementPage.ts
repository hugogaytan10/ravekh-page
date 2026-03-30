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

  async listCoupons(
    businessId: number,
    token: string,
  ): Promise<Array<{ id: number; qr: string; description: string; maxRedemptions: number; totalUsers: number; valid: string }>> {
    const coupons = await this.service.listCoupons(businessId, token);
    return coupons.map((coupon) => ({
      id: coupon.id,
      qr: coupon.qr,
      description: coupon.description,
      maxRedemptions: coupon.maxRedemptions,
      totalUsers: coupon.totalUsers,
      valid: coupon.valid,
    }));
  }

  async createCoupon(
    businessId: number,
    payload: { qr: string; description: string; maxRedemptions: number; valid?: string },
    token: string,
  ): Promise<{ id: number; qr: string; description: string; maxRedemptions: number; valid: string }> {
    const coupon = await this.service.createCoupon({
      businessId,
      qr: payload.qr,
      description: payload.description,
      maxRedemptions: payload.maxRedemptions,
      valid: payload.valid,
    }, token);

    return {
      id: coupon.id,
      qr: coupon.qr,
      description: coupon.description,
      maxRedemptions: coupon.maxRedemptions,
      valid: coupon.valid,
    };
  }

  async getVisitHistory(
    businessId: number,
    token: string,
  ): Promise<Array<{ id: number; userId: number; userName: string; date: string; visitCount: number; totalVisits: number }>> {
    const visits = await this.service.listVisits(businessId, token);
    return visits.map((visit) => ({
      id: visit.id,
      userId: visit.userId,
      userName: visit.userName,
      date: visit.date,
      visitCount: visit.visitCount,
      totalVisits: visit.totalVisits,
    }));
  }
}
