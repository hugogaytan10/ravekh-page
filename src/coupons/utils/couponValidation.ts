import type { Coupon } from "../models/coupon";

const isValidCoupon = (value: unknown): value is Coupon => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const coupon = value as Partial<Coupon>;

  return (
    typeof coupon.Id === "number" &&
    Number.isFinite(coupon.Id) &&
    typeof coupon.Description === "string" &&
    coupon.Description.trim().length > 0
  );
};

const toValidCoupons = (coupons: unknown): Coupon[] => {
  if (!Array.isArray(coupons)) {
    return [];
  }

  return coupons.filter(isValidCoupon);
};

export { isValidCoupon, toValidCoupons };
