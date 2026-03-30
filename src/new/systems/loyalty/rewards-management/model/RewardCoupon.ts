export class RewardCoupon {
  constructor(
    public readonly id: number,
    public readonly businessId: number,
    public readonly qr: string,
    public readonly description: string,
    public readonly maxRedemptions: number,
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
}

export class RewardVisit {
  constructor(
    public readonly id: number,
    public readonly businessId: number,
    public readonly customerReference: string,
    public readonly visits: number,
    public readonly createdAt: string,
  ) {}
}

export interface RegisterRewardVisitDto {
  businessId: number;
  customerReference: string;
  visits: number;
}
