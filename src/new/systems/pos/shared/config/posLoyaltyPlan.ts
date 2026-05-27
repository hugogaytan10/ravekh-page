export type PosCouponsPlan = 0 | 1 | 2;

export const normalizePosCouponsPlan = (value: unknown): PosCouponsPlan => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  if (parsed >= 2) return 2;
  if (parsed >= 1) return 1;
  return 0;
};

export const hasPosLoyaltyModule = (couponsPlan: PosCouponsPlan): boolean => couponsPlan >= 1;

export const hasPosDynamicVisitsQrModule = (couponsPlan: PosCouponsPlan): boolean => couponsPlan >= 2;
