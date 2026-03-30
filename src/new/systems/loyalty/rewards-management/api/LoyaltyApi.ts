import { HttpClient } from "../../../../core/api/HttpClient";
import { IRewardRepository } from "../interface/IRewardRepository";
import { CreateRewardCouponDto, RegisterRewardVisitDto, RewardCoupon, RewardVisit } from "../model/RewardCoupon";

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

type VisitResponse = {
  Id?: number;
  Business_Id?: number;
  CustomerReference?: string;
  Visits?: number;
  CreatedAt?: string;
};

const localVisitStorageKey = (businessId: number) => `pos-v2-loyalty-visits-${businessId}`;

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

  async listVisits(businessId: number, token: string): Promise<RewardVisit[]> {
    try {
      const response = await this.httpClient.request<VisitResponse[] | { data?: VisitResponse[] }>({
        method: "GET",
        path: `visits/business/${businessId}`,
        token,
      });

      const rows = Array.isArray(response) ? response : response?.data ?? [];
      const mapped = rows.map((row) => this.toVisitDomain(row, businessId)).filter((row) => row !== null) as RewardVisit[];
      if (mapped.length > 0) {
        this.persistVisitsLocal(businessId, mapped);
      }
      return mapped;
    } catch {
      return this.readVisitsLocal(businessId);
    }
  }

  async registerVisit(payload: RegisterRewardVisitDto, token: string): Promise<RewardVisit> {
    try {
      const response = await this.httpClient.request<VisitResponse>({
        method: "POST",
        path: "visits",
        token,
        body: {
          Business_Id: payload.businessId,
          CustomerReference: payload.customerReference,
          Visits: payload.visits,
        },
      });

      const visit = this.toVisitDomain(response, payload.businessId);
      if (!visit) {
        throw new Error("Invalid visit payload");
      }
      const current = this.readVisitsLocal(payload.businessId);
      this.persistVisitsLocal(payload.businessId, [visit, ...current]);
      return visit;
    } catch {
      const fallbackVisit = new RewardVisit(
        Date.now(),
        payload.businessId,
        payload.customerReference,
        payload.visits,
        new Date().toISOString(),
      );
      const current = this.readVisitsLocal(payload.businessId);
      this.persistVisitsLocal(payload.businessId, [fallbackVisit, ...current]);
      return fallbackVisit;
    }
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

  private toVisitDomain(response: VisitResponse, fallbackBusinessId: number): RewardVisit | null {
    const businessId = Number(response.Business_Id ?? fallbackBusinessId);
    const customerReference = String(response.CustomerReference ?? "").trim();
    const visits = Number(response.Visits ?? 0);
    const createdAt = String(response.CreatedAt ?? new Date().toISOString());
    const id = Number(response.Id ?? Date.now());

    if (!customerReference || !Number.isFinite(visits) || visits <= 0) {
      return null;
    }

    return new RewardVisit(
      Number.isFinite(id) ? id : Date.now(),
      Number.isFinite(businessId) ? businessId : fallbackBusinessId,
      customerReference,
      visits,
      createdAt,
    );
  }

  private readVisitsLocal(businessId: number): RewardVisit[] {
    try {
      const raw = window.localStorage.getItem(localVisitStorageKey(businessId));
      const parsed = raw ? JSON.parse(raw) as VisitResponse[] : [];
      return parsed.map((row) => this.toVisitDomain(row, businessId)).filter((row) => row !== null) as RewardVisit[];
    } catch {
      return [];
    }
  }

  private persistVisitsLocal(businessId: number, visits: RewardVisit[]): void {
    try {
      const payload = visits.slice(0, 200).map((visit) => ({
        Id: visit.id,
        Business_Id: visit.businessId,
        CustomerReference: visit.customerReference,
        Visits: visit.visits,
        CreatedAt: visit.createdAt,
      }));
      window.localStorage.setItem(localVisitStorageKey(businessId), JSON.stringify(payload));
    } catch {
      // ignore persistence failures
    }
  }
}
