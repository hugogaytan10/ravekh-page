import { URL } from "../CatalogoWeb/Const/Const";

interface CreateCouponPayload {
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
