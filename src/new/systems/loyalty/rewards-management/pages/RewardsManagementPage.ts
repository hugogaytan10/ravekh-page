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

  async getVisitHistory(
    businessId: number,
    token: string,
  ): Promise<Array<{ id: number; customerReference: string; visits: number; createdAt: string }>> {
    const visits = await this.service.listVisits(businessId, token);
    return visits.map((visit) => ({
      id: visit.id,
      customerReference: visit.customerReference,
      visits: visit.visits,
      createdAt: visit.createdAt,
    }));
  }

  async registerVisit(
    businessId: number,
    payload: { customerReference: string; visits: number },
    token: string,
  ): Promise<{ id: number; customerReference: string; visits: number; createdAt: string }> {
    const visit = await this.service.registerVisit({
      businessId,
      customerReference: payload.customerReference,
      visits: payload.visits,
    }, token);

    return {
      id: visit.id,
      customerReference: visit.customerReference,
      visits: visit.visits,
      createdAt: visit.createdAt,
    };
  }
}
