import { IRewardRepository } from "../interface/IRewardRepository";
import {
  CreateRewardCouponDto,
  DynamicVisitQrToken,
  GenerateVisitQrDto,
  RedeemVisitQrDto,
  RedeemVisitResult,
  RewardCoupon,
  RewardVisit,
  VisitQrToken,
} from "../model/RewardCoupon";

export class RewardService {
  constructor(private readonly repository: IRewardRepository) {}

  async getCouponByQr(businessId: number, qrCode: string, token: string): Promise<RewardCoupon> {
    return this.repository.getCouponByQr(businessId, qrCode, token);
  }

  async listCoupons(businessId: number, token: string): Promise<RewardCoupon[]> {
    return this.repository.listCoupons(businessId, token);
  }

  async createCoupon(payload: CreateRewardCouponDto, token: string): Promise<RewardCoupon> {
    return this.repository.createCoupon(payload, token);
  }

  async updateCoupon(couponId: number, payload: CreateRewardCouponDto, token: string): Promise<RewardCoupon> {
    return this.repository.updateCoupon(couponId, payload, token);
  }

  async deleteCoupon(couponId: number, token: string): Promise<void> {
    return this.repository.deleteCoupon(couponId, token);
  }

  async listVisits(businessId: number, token: string): Promise<RewardVisit[]> {
    return this.repository.listVisits(businessId, token);
  }

  async getVisitHistory(businessId: number, token: string): Promise<RewardVisit[]> {
    return this.repository.getVisitHistory(businessId, token);
  }

  async generateVisitQrs(payload: GenerateVisitQrDto, token: string): Promise<VisitQrToken[]> {
    return this.repository.generateVisitQrs(payload, token);
  }

  async generateDynamicVisitQr(businessId: number, domain: string, token: string): Promise<DynamicVisitQrToken> {
    return this.repository.generateDynamicVisitQr(businessId, domain, token);
  }

  async redeemVisitQr(payload: RedeemVisitQrDto, token: string): Promise<RedeemVisitResult> {
    return this.repository.redeemVisitQr(payload, token);
  }
}
