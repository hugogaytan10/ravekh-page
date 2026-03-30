import { CreateRewardCouponDto, RewardCoupon, RewardVisit } from "../model/RewardCoupon";

export interface IRewardRepository {
  getCouponByQr(businessId: number, qrCode: string, token: string): Promise<RewardCoupon>;
  listCoupons(businessId: number, token: string): Promise<RewardCoupon[]>;
  createCoupon(payload: CreateRewardCouponDto, token: string): Promise<RewardCoupon>;
  listVisits(businessId: number, token: string): Promise<RewardVisit[]>;
}
