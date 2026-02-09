import { URL } from "../../Components/CatalogoWeb/Const/Const";
import type { Visits } from "../models/coupon";

const getVisitsByUserId = async (userId: number): Promise<Visits[]> => {
  const endpoint = `${URL}visits/user/${userId}`;
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error("No se pudieron cargar las visitas del usuario.");
  }
  return response.json() as Promise<Visits[]>;
};

const getVisitHistoryByUserId = async (userId: number): Promise<Visits[]> => {
  const endpoint = `${URL}visits/user/history/${userId}`;
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error("No se pudo cargar el historial de visitas.");
  }
  return response.json() as Promise<Visits[]>;
};
const redeemVisitQr = async (token: string, userId: number) => {
  const response = await fetch(`${URL}visits/qr/redeem`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, userId }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message || "No se pudo registrar la visita.");
  }

  return response.json() as Promise<{ visitCreated: boolean; couponGenerated: boolean }>;
};

export {
    getVisitsByUserId,
    getVisitHistoryByUserId,
    redeemVisitQr,
}
