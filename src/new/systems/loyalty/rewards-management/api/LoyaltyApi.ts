import { HttpClient } from "../../../../core/api/HttpClient";
import { IRewardRepository } from "../interface/IRewardRepository";
import { CreateRewardCouponDto, RewardCoupon } from "../model/RewardCoupon";

type CouponResponse = {
  Id: number;
  Business_Id: number;
  QR: string;
  Description: string;
  LimitUsers: number;
};

type CouponEnvelope = {
  coupon?: CouponResponse;
  newCoupon?: CouponResponse;
  createdCoupon?: CouponResponse;
  data?: CouponResponse;
};

export class LoyaltyApi implements IRewardRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getCouponByQr(businessId: number, qrCode: string, token: string): Promise<RewardCoupon> {
    const response = await this.httpClient.request<CouponEnvelope | CouponResponse>({
      method: "GET",
      path: `coupons/business/${businessId}/qr/${encodeURIComponent(qrCode)}`,
      token,
    });

    return this.toDomain(response);
  }

  async createCoupon(payload: CreateRewardCouponDto, token: string): Promise<RewardCoupon> {
    const response = await this.httpClient.request<CouponEnvelope | CouponResponse>({
      method: "POST",
      path: "coupons",
      token,
      body: {
        Business_Id: payload.businessId,
        QR: payload.qr,
        Description: payload.description,
        LimitUsers: payload.maxRedemptions,
      },
    });

    return this.toDomain(response);
  }

  private toDomain(response: CouponEnvelope | CouponResponse): RewardCoupon {
    const normalized =
      (response as CouponEnvelope).coupon ??
      (response as CouponEnvelope).newCoupon ??
      (response as CouponEnvelope).createdCoupon ??
      (response as CouponEnvelope).data ??
      (response as CouponResponse);

    return new RewardCoupon(
      normalized.Id,
      normalized.Business_Id,
      normalized.QR,
      normalized.Description,
      normalized.LimitUsers,
    );
  }
}
