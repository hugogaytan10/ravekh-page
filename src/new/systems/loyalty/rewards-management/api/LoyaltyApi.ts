import { HttpClient } from "../../../../core/api/HttpClient";
import { IRewardRepository } from "../interface/IRewardRepository";
import { CreateRewardCouponDto, RewardCoupon, RewardVisit } from "../model/RewardCoupon";

type CouponResponse = {
  Id: number;
  Business_Id: number;
  QR: string;
  Description: string;
  LimitUsers: number;
  TotalUsers?: number;
  Valid?: string;
};

type CouponEnvelope = {
  coupon?: CouponResponse;
  newCoupon?: CouponResponse;
  createdCoupon?: CouponResponse;
  data?: CouponResponse;
};

type VisitResponse = {
  Id?: number;
  Business_Id?: number;
  User_Id?: number;
  UserName?: string;
  Date?: string;
  VisitCount?: number;
  TotalVisits?: number;
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

  async listCoupons(businessId: number, token: string): Promise<RewardCoupon[]> {
    const response = await this.httpClient.request<CouponResponse[] | { coupons?: CouponResponse[]; data?: CouponResponse[] | { coupon?: CouponResponse[] } }>({
      method: "GET",
      path: `coupons/business/${businessId}`,
      token,
    });

    const rows =
      Array.isArray(response) ? response
        : Array.isArray(response?.coupons) ? response.coupons
          : Array.isArray(response?.data) ? response.data
            : Array.isArray(response?.data?.coupon) ? response.data.coupon
              : [];

    return rows.map((row) => this.toDomain(row));
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
        ...(payload.valid ? { Valid: payload.valid } : {}),
      },
    });

    return this.toDomain(response);
  }

  async listVisits(businessId: number, token: string): Promise<RewardVisit[]> {
    const response = await this.httpClient.request<VisitResponse[] | { data?: VisitResponse[] | { visits?: VisitResponse[] }; visits?: VisitResponse[] }>({
      method: "GET",
      path: `visits/business/${businessId}`,
      token,
    });

    const rows =
      Array.isArray(response) ? response
        : Array.isArray(response?.visits) ? response.visits
          : Array.isArray(response?.data) ? response.data
            : Array.isArray(response?.data?.visits) ? response.data.visits
              : [];

    return rows.map((row) => this.toVisitDomain(row, businessId)).filter((row) => row !== null) as RewardVisit[];
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
      Number(normalized.TotalUsers ?? 0),
      String(normalized.Valid ?? ""),
    );
  }

  private toVisitDomain(response: VisitResponse, fallbackBusinessId: number): RewardVisit | null {
    const businessId = Number(response.Business_Id ?? fallbackBusinessId);
    const userId = Number(response.User_Id ?? 0);
    const userName = String(response.UserName ?? "").trim();
    const visitCount = Number(response.VisitCount ?? 0);
    const totalVisits = Number(response.TotalVisits ?? visitCount);
    const createdAt = String(response.Date ?? new Date().toISOString());
    const id = Number(response.Id ?? Date.now());

    if (!Number.isFinite(visitCount) || visitCount <= 0) {
      return null;
    }

    return new RewardVisit(
      Number.isFinite(id) ? id : Date.now(),
      Number.isFinite(businessId) ? businessId : fallbackBusinessId,
      Number.isFinite(userId) ? userId : 0,
      userName,
      createdAt,
      visitCount,
      Number.isFinite(totalVisits) ? totalVisits : visitCount,
    );
  }
}
