import { URL } from "../CatalogoWeb/Const/Const";

interface CreateCouponPayload {
  Business_Id: number;
  QR: string;
  Description: string;
  Valid: string;
  LimitUsers: number;
}

interface Coupon {
  Id: number;
  Business_Id: number;
  QR: string;
  Description: string;
  Valid: string;
  LimitUsers: number;
}

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
export type { CreateCouponPayload };

const getCouponsByBusiness = async (businessId: number) => {
  const response = await fetch(`${URL}coupons/business/${businessId}`);

  if (!response.ok) {
    throw new Error("No se pudieron cargar los cupones.");
  }

  return response.json() as Promise<Coupon[]>;
};
const getCouponsByUser = async (businessId: number) => {
  const response = await fetch(`${URL}coupons/business/${businessId}`);

  if (!response.ok) {
    throw new Error("No se pudieron cargar los cupones.");
  }

  return response.json() as Promise<Coupon[]>;
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

export { getCouponsByBusiness, updateCoupon, deleteCoupon };
export type { Coupon };

interface LoginPayload {
  Email: string;
  Password: string;
}

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

export { loginCupones };
export type { LoginPayload };
