export class RewardCoupon {
  constructor(
    public readonly id: number,
    public readonly businessId: number,
    public readonly qr: string,
    public readonly description: string,
    public readonly maxRedemptions: number,
    public readonly totalUsers: number = 0,
    public readonly valid: string = "",
  ) {}

  canBeRedeemed(currentRedemptions: number): boolean {
    return currentRedemptions < this.maxRedemptions;
  }
}

export interface CreateRewardCouponDto {
  businessId: number;
  qr: string;
  description: string;
  maxRedemptions: number;
  valid?: string;
}

export class RewardVisit {
  constructor(
    public readonly id: number,
    public readonly businessId: number,
    public readonly userId: number,
    public readonly userName: string,
    public readonly date: string,
    public readonly visitCount: number,
    public readonly totalVisits: number,
  ) {}
}

export interface GenerateVisitQrDto {
  businessId: number;
  quantity: number;
  ttlMinutes: number;
  domain: string;
}

export interface VisitQrToken {
  token: string;
  qrUrl: string;
}

export interface DynamicVisitQrToken {
  token: string;
  qrUrl: string;
  refreshAfterSeconds: number;
}

export interface RegisterRewardVisitDto {
  businessId: number;
  customerReference: string;
  visits: number;
}
