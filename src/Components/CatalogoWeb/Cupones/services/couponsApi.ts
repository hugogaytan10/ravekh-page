import { URL } from "../../Const/Const";
import { Coupon } from "../types";

type ErrorPayload = {
  message?: string;
};

const parseJsonOrNull = async <T,>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const buildHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const buildRequestError = async (response: Response, fallback: string): Promise<Error> => {
  const payload = await parseJsonOrNull<ErrorPayload>(response);
  return new Error(payload?.message?.trim() || fallback);
};

export const createCoupon = async (payload: Coupon, token?: string): Promise<Coupon> => {
  const response = await fetch(`${URL}coupons`, {
    method: "POST",
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await buildRequestError(response, "No se pudo crear el cupón.");
  }

  return (await parseJsonOrNull<Coupon>(response)) ?? payload;
};

export const updateCoupon = async (
  id: number | string,
  payload: Coupon,
  token?: string,
): Promise<Coupon> => {
  const response = await fetch(`${URL}coupons/${id}`, {
    method: "PUT",
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await buildRequestError(response, "No se pudo actualizar el cupón.");
  }

  return (await parseJsonOrNull<Coupon>(response)) ?? { ...payload, Id: id };
};
