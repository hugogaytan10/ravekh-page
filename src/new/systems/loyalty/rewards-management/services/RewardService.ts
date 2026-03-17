import { IRewardRepository } from "../interface/IRewardRepository";
import { CreateRewardCouponDto, RewardCoupon } from "../model/RewardCoupon";

export class RewardService {
  constructor(private readonly repository: IRewardRepository) {}

  async getCouponByQr(businessId: number, qrCode: string, token: string): Promise<RewardCoupon> {
    return this.repository.getCouponByQr(businessId, qrCode, token);
  }

  async createCoupon(payload: CreateRewardCouponDto, token: string): Promise<RewardCoupon> {
    return this.repository.createCoupon(payload, token);
  }
}
