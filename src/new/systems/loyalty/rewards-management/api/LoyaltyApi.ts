import { HttpClient } from "../../../../core/api/HttpClient";
import { IRewardRepository } from "../interface/IRewardRepository";
import { CreateRewardCouponDto, DynamicVisitQrToken, GenerateVisitQrDto, RewardCoupon, RewardVisit, VisitQrToken } from "../model/RewardCoupon";

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

type VisitQrTokenResponse = {
  token?: string;
  qr?: string;
  url?: string;
  qrUrl?: string;
};

type DynamicVisitQrResponse = {
  token?: string;
  qrUrl?: string;
  refreshAfterSeconds?: number;
  data?: DynamicVisitQrResponse;
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

  async generateVisitQrs(payload: GenerateVisitQrDto, token: string): Promise<VisitQrToken[]> {
    const response = await this.httpClient.request<{ tokens?: VisitQrTokenResponse[]; data?: { tokens?: VisitQrTokenResponse[] } }>({
      method: "POST",
      path: "visits/qr/generate",
      token,
      body: {
        businessId: payload.businessId,
        quantity: payload.quantity,
        ttlMinutes: payload.ttlMinutes,
        domain: payload.domain,
      },
    });

    const tokens = Array.isArray(response?.tokens)
      ? response.tokens
      : Array.isArray(response?.data?.tokens)
        ? response.data.tokens
        : [];

    return tokens
      .map((item) => ({
        token: String(item.token ?? "").trim(),
        qrUrl: String(item.qrUrl ?? item.qr ?? item.url ?? "").trim(),
      }))
      .filter((item) => item.token.length > 0 || item.qrUrl.length > 0);
  }

  async generateDynamicVisitQr(businessId: number, domain: string, token: string): Promise<DynamicVisitQrToken> {
    const response = await this.httpClient.request<DynamicVisitQrResponse>({
      method: "POST",
      path: "visits/qr/dynamic/next",
      token,
      body: { businessId, domain },
    });

    const normalized = response?.qrUrl ? response : response?.data;
    const qrUrl = String(normalized?.qrUrl ?? "").trim();
    if (!qrUrl) {
      throw new Error("No se recibió un QR dinámico válido.");
    }

    return {
      token: String(normalized?.token ?? "").trim(),
      qrUrl,
      refreshAfterSeconds: Number(normalized?.refreshAfterSeconds ?? 60),
    };
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
