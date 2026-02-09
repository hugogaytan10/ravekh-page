import { URL } from "../../Components/CatalogoWeb/Const/Const";
import type { Coupon, CouponHasUser, CreateCouponPayload } from "../models/coupon";
import type { LoginPayload } from "../models/auth";

const createCoupon = async (payload: CreateCouponPayload) => {
  const response = await fetch(`${URL}coupons`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("No se pudo guardar el cupón.");
  }

  return response;
};

export { createCoupon };

const getCouponsByBusiness = async (businessId: number) => {
  const response = await fetch(`${URL}coupons/business/${businessId}`);

  if (!response.ok) {
    throw new Error("No se pudieron cargar los cupones.");
  }

  return response.json() as Promise<Coupon[]>;
};

const getCouponById = async (couponId: number) => {
  const response = await fetch(`${URL}coupons/${couponId}`);

  if (!response.ok) {
    throw new Error("No se pudo cargar el cupón.");
  }

  return response.json() as Promise<Coupon | null>;
};

const getCouponHasUsersByUser = async (userId: number) => {
  const response = await fetch(`${URL}couponhasusers/user/${userId}`);

  if (!response.ok) {
    throw new Error("No se pudieron cargar los cupones del usuario.");
  }

  return response.json() as Promise<CouponHasUser[] | null>;
};

const getCouponsByUser = async (userId: number) => {
  const relations = await getCouponHasUsersByUser(userId);

  if (!relations || relations.length === 0) {
    return [] as Coupon[];
  }

  const coupons = await Promise.all(
    relations.map(async (relation) => getCouponById(relation.Coupon_Id))
  );

  return coupons.filter((coupon): coupon is Coupon => Boolean(coupon));
};
const updateCoupon = async (couponId: number, payload: CreateCouponPayload) => {
  const response = await fetch(`${URL}coupons/${couponId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("No se pudo actualizar el cupón.");
  }

  return response;
};

const deleteCoupon = async (couponId: number) => {
  const response = await fetch(`${URL}coupons/${couponId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("No se pudo eliminar el cupón.");
  }

  return response;
};

export { getCouponById, getCouponHasUsersByUser, getCouponsByBusiness, getCouponsByUser, updateCoupon, deleteCoupon };

const deleteCouponsAccount = async (userId: number, token: string) => {
  const response = await fetch(`${URL}employee/${userId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      token,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message || "No se pudo eliminar la cuenta.";
    throw new Error(message);
  }

  return data;
};

const loginCupones = async (payload: LoginPayload) => {
  const response = await fetch(`${URL}Login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("No se pudo iniciar sesión.");
  }

  return response.json();
};

export { deleteCouponsAccount, loginCupones };
export type { Coupon, CouponHasUser, CreateCouponPayload, LoginPayload };
