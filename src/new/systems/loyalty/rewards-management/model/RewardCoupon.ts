export class RewardCoupon {
  constructor(
    public readonly id: number,
    public readonly businessId: number,
    public readonly qr: string,
    public readonly description: string,
    public readonly maxRedemptions: number,
    public readonly totalUsers: number = 0,
    public readonly valid: string = "",
    public readonly branchIds: number[] | null = null,
    public readonly branchNames: string[] = [],
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
  branchIds?: number[] | null;
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
    public readonly minVisits: number = 0,
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

export interface RedeemVisitQrDto {
  token: string;
  userId: number;
  regenerateDynamicQr?: boolean;
}

export interface RedeemVisitResult {
  visitCreated: boolean;
  couponGenerated: boolean;
}

export interface RegisterRewardVisitDto {
  businessId: number;
  customerReference: string;
  visits: number;
}

export const normalizeDynamicVisitQr = (payload: unknown): DynamicVisitQrToken => {
  const row = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const qrUrl = typeof row.qrUrl === "string" ? row.qrUrl.trim() : "";
  if (!qrUrl) throw new Error("No se recibió un QR dinámico válido.");
  const seconds = Number(row.refreshAfterSeconds);
  return {
    token: typeof row.token === "string" ? row.token.trim() : "",
    qrUrl,
    refreshAfterSeconds: Number.isFinite(seconds) && seconds > 0 ? Math.min(600, Math.max(5, seconds)) : 60,
  };
};

export const couponBranchLabel = (ids?:number[]|null,names?:string[]):string =>
  ids?.length ? `Válido en: ${names?.join(', ') || ids.map(id=>`Sucursal #${id}`).join(', ')}` : 'Válido en todas las sucursales';
