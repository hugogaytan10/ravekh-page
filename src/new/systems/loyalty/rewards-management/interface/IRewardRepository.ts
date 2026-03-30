import { CreateRewardCouponDto, DynamicVisitQrToken, GenerateVisitQrDto, RewardCoupon, RewardVisit, VisitQrToken } from "../model/RewardCoupon";

export interface IRewardRepository {
  getCouponByQr(businessId: number, qrCode: string, token: string): Promise<RewardCoupon>;
  listCoupons(businessId: number, token: string): Promise<RewardCoupon[]>;
  createCoupon(payload: CreateRewardCouponDto, token: string): Promise<RewardCoupon>;
  listVisits(businessId: number, token: string): Promise<RewardVisit[]>;
  generateVisitQrs(payload: GenerateVisitQrDto, token: string): Promise<VisitQrToken[]>;
  generateDynamicVisitQr(businessId: number, domain: string, token: string): Promise<DynamicVisitQrToken>;
}
