import { URL } from "../../Components/CatalogoWeb/Const/Const";
import type { ClaimCouponPayload, Coupon, CouponHasUser, CreateCouponPayload } from "../models/coupon";
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

const getCouponDisponibility = async (userId: number) => {
  try {
    const response = await fetch(`${URL}coupons/user/${userId}`);
    if (!response.ok) {
      throw new Error("No se pudieron cargar las relaciones de cupones del usuario.");
    }
    return response.json() as Promise<Coupon[] | null>;
  } catch (error) {
    throw new Error("Error al obtener las relaciones de cupones del usuario.");
  }
};

const getCouponsByUser = async (userId: number) => {
  try {
    const response = await fetch(`${URL}couponhasusers/user/${userId}`);
    if (!response.ok) {
      throw new Error("No se pudieron cargar las relaciones de cupones del usuario.");
    }

    return (await response.json()) as CouponHasUser[] | null;
  } catch (error) {
    throw new Error("Error al obtener los cupones del usuario.");
  }
};

const getClaimedCouponsByUser = async (userId: number) => {
  const relations = await getCouponsByUser(userId);
  if (!relations || relations.length === 0) {
    return [] as Coupon[];
  }

  const uniqueCouponIds = Array.from(new Set(relations.map((relation) => relation.Coupon_Id)));
  const coupons = await Promise.all(uniqueCouponIds.map(async (couponId) => getCouponById(couponId)));

  return coupons.filter((coupon): coupon is Coupon => Boolean(coupon));
};

const claimCoupon = async (payload: ClaimCouponPayload) => {
  const response = await fetch(`${URL}coupons/take`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("No se pudo reclamar el cupón.");
  }

  return response.json().catch(() => null);
};

const getCouponsDisponibilityByUser = async (userId: number) => {
  const relations = await getCouponDisponibility(userId);
  if (!relations || relations.length === 0) {
    return [] as Coupon[];
  }

  const coupons = await Promise.all(
    relations.map(async (relation) => getCouponById(relation.Id))
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

export {
  claimCoupon,
  getClaimedCouponsByUser,
  getCouponById,
  getCouponDisponibility,
  getCouponsDisponibilityByUser,
  getCouponsByBusiness,
  getCouponsByUser,
  updateCoupon,
  deleteCoupon,
};

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
export type { ClaimCouponPayload, Coupon, CouponHasUser, CreateCouponPayload, LoginPayload };
