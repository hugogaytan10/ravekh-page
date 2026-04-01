import { HttpClient } from "../../../../../core/api/HttpClient";
import type { ILoyaltyCustomerRepository } from "../interface/ILoyaltyCustomerRepository";
import type {
  LoyaltyCustomerCoupon,
  LoyaltyCustomerProfile,
  LoyaltyVisitProgress,
  RedeemVisitTokenPayload,
  RedeemVisitTokenResult,
} from "../model/LoyaltyCustomer";

type CustomerResponse = {
  Id?: number;
  Name?: string;
  Email?: string;
  id?: number;
  name?: string;
  email?: string;
};

type VisitResponse = {
  User_Id?: number;
  UserName?: string;
  VisitCount?: number;
  TotalVisits?: number;
  userId?: number;
  userName?: string;
  visitCount?: number;
  totalVisits?: number;
};

type CouponResponse = {
  Id?: number;
  Description?: string;
  QR?: string;
  Redeemed?: number | boolean;
  Valid?: string;
};

export class LoyaltyCustomerApi implements ILoyaltyCustomerRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async validateCustomerToken(token: string): Promise<LoyaltyCustomerProfile> {
    const response = await this.httpClient.request<CustomerResponse | { user?: CustomerResponse; customer?: CustomerResponse }>({
      method: "GET",
      path: `customer/token/${encodeURIComponent(token)}`,
    });

    const payload = "user" in response && response.user ? response.user : "customer" in response && response.customer ? response.customer : response;
    const id = Number(payload?.Id ?? payload?.id ?? 0);
    if (!Number.isFinite(id) || id <= 0) {
      throw new Error("Token de cliente inválido o expirado.");
    }

    return {
      id,
      name: String(payload?.Name ?? payload?.name ?? `Cliente ${id}`),
      email: payload?.Email ?? payload?.email,
    };
  }

  async getVisitProgress(customerId: number): Promise<LoyaltyVisitProgress> {
    const response = await this.httpClient.request<VisitResponse[] | { visits?: VisitResponse[] }>({
      method: "GET",
      path: `visits/user/${customerId}`,
    });

    const rows = Array.isArray(response) ? response : response.visits ?? [];
    const top = rows[0] ?? {};
    const totalVisits = Number(top.TotalVisits ?? top.totalVisits ?? top.VisitCount ?? top.visitCount ?? 0);
    const visitsRequired = 10;

    return {
      customerId,
      customerName: String(top.UserName ?? top.userName ?? `Cliente ${customerId}`),
      totalVisits,
      visitsRequired,
      remainingVisits: Math.max(visitsRequired - totalVisits, 0),
      completionRatio: visitsRequired > 0 ? Math.min(totalVisits / visitsRequired, 1) : 0,
    };
  }

  async listCustomerCoupons(customerId: number): Promise<LoyaltyCustomerCoupon[]> {
    const response = await this.httpClient.request<CouponResponse[]>({
      method: "GET",
      path: `coupons/user/${customerId}`,
    });

    return (Array.isArray(response) ? response : []).map((coupon) => ({
      id: Number(coupon.Id ?? 0),
      description: String(coupon.Description ?? "Cupón sin descripción"),
      qr: String(coupon.QR ?? ""),
      isRedeemed: Boolean(coupon.Redeemed),
      expiresAt: coupon.Valid,
    }));
  }

  async redeemVisitToken(payload: RedeemVisitTokenPayload): Promise<RedeemVisitTokenResult> {
    const response = await this.httpClient.request<Partial<RedeemVisitTokenResult> & { success?: boolean }>({
      method: "POST",
      path: "visits/qr/redeem",
      body: {
        token: payload.token,
        userId: payload.customerId,
      },
    });

    return {
      visitCreated: Boolean(response.visitCreated ?? response.success ?? true),
      couponGenerated: Boolean(response.couponGenerated),
      message: response.message ?? "Visita registrada correctamente.",
    };
  }

  async redeemCoupon(couponId: number, customerId: number): Promise<void> {
    await this.httpClient.request({
      method: "PUT",
      path: `couponhasusers/coupon/${couponId}/user/${customerId}`,
    });
  }
}
