import { URL } from "../Const/Const";
import type { Coupon } from "./types";

const buildHeaders = (token?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
    headers.token = token;
  }

  return headers;
};

export const createCoupon = async (coupon: Coupon, token?: string): Promise<Coupon> => {
  const headers = buildHeaders(token);

  const response = await fetch(`${URL}coupons`, {
    method: "POST",
    headers,
    body: JSON.stringify(coupon),
  });

  const data = await response.json();

  console.log("[Coupons][createCoupon] status/data:", {
    status: response.status,
    ok: response.ok,
    data,
  });

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo crear el cupón.");
  }

  const normalizedCoupon =
    data?.coupon ??
    data?.newCoupon ??
    data?.createdCoupon ??
    data?.data?.coupon ??
    data?.data?.newCoupon ??
    data?.data?.createdCoupon ??
    data?.data ??
    data;

  const parsedId = Number(normalizedCoupon);
  const couponFromNumericId =
    Number.isFinite(parsedId) && parsedId > 0 ? ({ ...coupon, Id: parsedId } as Coupon) : null;

  const finalCoupon =
    couponFromNumericId ||
    (normalizedCoupon && typeof normalizedCoupon === "object"
      ? (normalizedCoupon as Coupon)
      : coupon);

  console.log("[Coupons][createCoupon] normalized coupon:", {
    normalizedCoupon,
    finalCoupon,
    extractedId: (finalCoupon as any)?.Id ?? (finalCoupon as any)?.id ?? (finalCoupon as any)?.couponId,
  });

  return finalCoupon;
};

export const updateCoupon = async (
  couponId: number,
  coupon: Coupon,
  token?: string,
): Promise<Coupon> => {
  const headers = buildHeaders(token);

  const response = await fetch(`${URL}coupons/${couponId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(coupon),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo actualizar el cupón.");
  }

  return (data?.coupon || data?.updatedCoupon || data?.data?.coupon || data) as Coupon;
};


export const getCouponsByBusiness = async (businessId: number, token?: string): Promise<Coupon[]> => {
  const headers = buildHeaders(token);
  console.log("el bussines Id que ando agarrando es este",businessId)
  const response = await fetch(`${URL}coupons/business/${businessId}`, {
    method: "GET",
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "No se pudieron cargar los cupones.");
  }

  const normalized =
    data?.coupons ??
    data?.data?.coupons ??
    data?.data ??
    data;

  return Array.isArray(normalized) ? (normalized as Coupon[]) : [];
};
