import { IRewardRepository } from "../interface/IRewardRepository";
import { CreateRewardCouponDto, RewardCoupon, RewardVisit } from "../model/RewardCoupon";

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

  async listVisits(businessId: number, token: string): Promise<RewardVisit[]> {
    return this.repository.listVisits(businessId, token);
  }
}
