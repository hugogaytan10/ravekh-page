import { CreateRewardCouponDto, RewardCoupon } from "../model/RewardCoupon";

export interface IRewardRepository {
  getCouponByQr(businessId: number, qrCode: string, token: string): Promise<RewardCoupon>;
  createCoupon(payload: CreateRewardCouponDto, token: string): Promise<RewardCoupon>;
}
