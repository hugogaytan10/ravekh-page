import { RewardService } from "../services/RewardService";

export class RewardsManagementPage {
  constructor(private readonly service: RewardService) {}

  async lookupCoupon(businessId: number, qrCode: string, token: string): Promise<{ id: number; description: string; maxRedemptions: number; branchIds:number[]|null; branchNames:string[] }> {
    const coupon = await this.service.getCouponByQr(businessId, qrCode, token);

    return {
      id: coupon.id,
      description: coupon.description,
      maxRedemptions: coupon.maxRedemptions,
      branchIds: coupon.branchIds,
      branchNames: coupon.branchNames,
    };
  }

  async listCoupons(
    businessId: number,
    token: string,
  ): Promise<Array<{ id: number; qr: string; description: string; maxRedemptions: number; totalUsers: number; valid: string; branchIds:number[]|null; branchNames:string[] }>> {
    const coupons = await this.service.listCoupons(businessId, token);
    return coupons.map((coupon) => ({
      id: coupon.id,
      qr: coupon.qr,
      description: coupon.description,
      maxRedemptions: coupon.maxRedemptions,
      totalUsers: coupon.totalUsers,
      valid: coupon.valid,
      branchIds: coupon.branchIds,
      branchNames: coupon.branchNames,
    }));
  }

  async createCoupon(
    businessId: number,
    payload: { qr: string; description: string; maxRedemptions: number; valid?: string; branchIds?:number[]|null },
    token: string,
  ): Promise<{ id: number; qr: string; description: string; maxRedemptions: number; valid: string; branchIds:number[]|null; branchNames:string[] }> {
    const coupon = await this.service.createCoupon({
      businessId,
      qr: payload.qr,
      description: payload.description,
      maxRedemptions: payload.maxRedemptions,
      valid: payload.valid,
      branchIds: payload.branchIds,
    }, token);

    return {
      id: coupon.id,
      qr: coupon.qr,
      description: coupon.description,
      maxRedemptions: coupon.maxRedemptions,
      valid: coupon.valid,
      branchIds: coupon.branchIds,
      branchNames: coupon.branchNames,
    };
  }

  async updateCoupon(
    couponId: number,
    businessId: number,
    payload: { qr: string; description: string; maxRedemptions: number; valid?: string; branchIds?:number[]|null },
    token: string,
  ): Promise<{ id: number; qr: string; description: string; maxRedemptions: number; valid: string; branchIds:number[]|null; branchNames:string[] }> {
    const coupon = await this.service.updateCoupon(couponId, {
      businessId,
      qr: payload.qr,
      description: payload.description,
      maxRedemptions: payload.maxRedemptions,
      valid: payload.valid,
      branchIds: payload.branchIds,
    }, token);

    return {
      id: coupon.id,
      qr: coupon.qr,
      description: coupon.description,
      maxRedemptions: coupon.maxRedemptions,
      valid: coupon.valid,
      branchIds: coupon.branchIds,
      branchNames: coupon.branchNames,
    };
  }

  async deleteCoupon(couponId: number, token: string): Promise<void> {
    await this.service.deleteCoupon(couponId, token);
  }

  async getVisitHistory(
    businessId: number,
    token: string,
  ): Promise<Array<{ id: number; userId: number; userName: string; date: string; visitCount: number; totalVisits: number; minVisits: number }>> {
    const visits = await this.service.getVisitHistory(businessId, token);
    return visits.map((visit) => ({
      id: visit.id,
      userId: visit.userId,
      userName: visit.userName,
      date: visit.date,
      visitCount: visit.visitCount,
      totalVisits: visit.totalVisits,
      minVisits: visit.minVisits,
    }));
  }

  async generateVisitQrs(
    businessId: number,
    payload: { quantity: number; ttlMinutes: number; domain: string },
    token: string,
  ): Promise<Array<{ token: string; qrUrl: string }>> {
    return this.service.generateVisitQrs({
      businessId,
      quantity: payload.quantity,
      ttlMinutes: payload.ttlMinutes,
      domain: payload.domain,
    }, token);
  }

  async generateDynamicVisitQr(
    businessId: number,
    domain: string,
    token: string,
  ): Promise<{ token: string; qrUrl: string; refreshAfterSeconds: number }> {
    return this.service.generateDynamicVisitQr(businessId, domain, token);
  }

  async redeemVisitQr(
    payload: { token: string; userId: number; regenerateDynamicQr?: boolean },
    token: string,
  ): Promise<{ visitCreated: boolean; couponGenerated: boolean }> {
    return this.service.redeemVisitQr(payload, token);
  }
}
