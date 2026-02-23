import { URL } from "../../Components/CatalogoWeb/Const/Const";
import type { ClaimCouponPayload, Coupon, CouponHasUser, CreateCouponPayload } from "../models/coupon";
import type { LoginPayload } from "../models/auth";

type LoginResponse = {
  Id?: number | string;
  Business_Id?: number | string;
  Name?: string;
  Role?: string;
  Token?: string;
};

type RegisterPayload = {
  Role: "CLIENTE";
  Business_Id: number;
  Name: string;
  Email: string;
  Password: string;
};

type RegisterResponse = {
  Id?: number | string;
  id?: number | string;
  message?: string;
};

const isValidId = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value > 0;

const parseJsonOrNull = async <T>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const buildHttpError = async (response: Response, fallback: string): Promise<Error> => {
  const payload = await parseJsonOrNull<{ message?: string }>(response);
  return new Error(payload?.message?.trim() || fallback);
};

const createCoupon = async (payload: CreateCouponPayload): Promise<Response> => {
  const response = await fetch(`${URL}coupons`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await buildHttpError(response, "No se pudo guardar el cupón.");
  }

  return response;
};

const getCouponsByBusiness = async (businessId: number): Promise<Coupon[]> => {
  if (!isValidId(businessId)) {
    return [];
  }

  const response = await fetch(`${URL}coupons/business/${businessId}`);

  if (!response.ok) {
    throw await buildHttpError(response, "No se pudieron cargar los cupones.");
  }

  const data = await parseJsonOrNull<Coupon[]>(response);
  return Array.isArray(data) ? data : [];
};

const getCouponById = async (couponId: number): Promise<Coupon | null> => {
  if (!isValidId(couponId)) {
    return null;
  }

  const response = await fetch(`${URL}coupons/${couponId}`);

  if (!response.ok) {
    throw await buildHttpError(response, "No se pudo cargar el cupón.");
  }

  return (await parseJsonOrNull<Coupon>(response)) ?? null;
};

const getCouponDisponibility = async (userId: number): Promise<Coupon[] | null> => {
  if (!isValidId(userId)) {
    return [];
  }

  try {
    const response = await fetch(`${URL}coupons/user/${userId}`);
    if (!response.ok) {
      throw await buildHttpError(response, "No se pudieron cargar las relaciones de cupones del usuario.");
    }

    const data = await parseJsonOrNull<Coupon[] | null>(response);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Error al obtener las relaciones de cupones del usuario.");
  }
};

const getCouponsByUser = async (userId: number): Promise<CouponHasUser[] | null> => {
  if (!isValidId(userId)) {
    return [];
  }

  try {
    const response = await fetch(`${URL}couponhasusers/user/${userId}`);
    if (!response.ok) {
      throw await buildHttpError(response, "No se pudieron cargar las relaciones de cupones del usuario.");
    }

    const data = await parseJsonOrNull<CouponHasUser[] | null>(response);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Error al obtener los cupones del usuario.");
  }
};

const getClaimedCouponsByUser = async (userId: number): Promise<Coupon[]> => {
  const relations = await getCouponsByUser(userId);
  if (!relations || relations.length === 0) {
    return [];
  }

  const uniqueCouponIds = Array.from(new Set(relations.map((relation) => relation.Coupon_Id).filter(isValidId)));
  const coupons = await Promise.all(uniqueCouponIds.map(async (couponId) => getCouponById(couponId)));

  return coupons.filter((coupon): coupon is Coupon => Boolean(coupon));
};

const claimCoupon = async (payload: ClaimCouponPayload): Promise<unknown> => {
  const response = await fetch(`${URL}coupons/take`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await buildHttpError(response, "No se pudo reclamar el cupón.");
  }

  return (await parseJsonOrNull<unknown>(response)) ?? null;
};

const getCouponsDisponibilityByUser = async (userId: number): Promise<Coupon[]> => {
  const relations = await getCouponDisponibility(userId);
  if (!relations || relations.length === 0) {
    return [];
  }

  const coupons = await Promise.all(relations.map(async (relation) => getCouponById(relation.Id)));

  return coupons.filter((coupon): coupon is Coupon => Boolean(coupon));
};

const updateCoupon = async (couponId: number, payload: CreateCouponPayload): Promise<Response> => {
  const response = await fetch(`${URL}coupons/${couponId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await buildHttpError(response, "No se pudo actualizar el cupón.");
  }

  return response;
};

const deleteCoupon = async (couponId: number): Promise<Response> => {
  const response = await fetch(`${URL}coupons/${couponId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw await buildHttpError(response, "No se pudo eliminar el cupón.");
  }

  return response;
};

const deleteCouponsAccount = async (userId: number, token: string): Promise<{ message?: string } | null> => {
  const response = await fetch(`${URL}employee/${userId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      token,
    },
  });

  const data = await parseJsonOrNull<{ message?: string }>(response);

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo eliminar la cuenta.");
  }

  return data;
};

const loginCupones = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await fetch(`${URL}Login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await buildHttpError(response, "No se pudo iniciar sesión.");
  }

  return (await parseJsonOrNull<LoginResponse>(response)) ?? {};
};

const registerCupones = async (payload: RegisterPayload): Promise<RegisterResponse> => {
  const response = await fetch(`${URL}employee`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await buildHttpError(response, "No se pudo registrar la cuenta.");
  }

  return (await parseJsonOrNull<RegisterResponse>(response)) ?? {};
};

export {
  claimCoupon,
  createCoupon,
  deleteCoupon,
  deleteCouponsAccount,
  getClaimedCouponsByUser,
  getCouponById,
  getCouponDisponibility,
  getCouponsByBusiness,
  getCouponsByUser,
  getCouponsDisponibilityByUser,
  loginCupones,
  registerCupones,
  updateCoupon,
};

export type { ClaimCouponPayload, Coupon, CouponHasUser, CreateCouponPayload, LoginPayload, LoginResponse, RegisterPayload, RegisterResponse };
