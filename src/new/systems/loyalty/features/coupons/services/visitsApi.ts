import { URL } from "../../../../../../Components/CatalogoWeb/Const/Const";
import type { Visits } from "../models/coupon";

type RedeemVisitResponse = { visitCreated: boolean; couponGenerated: boolean };

type RedeemVisitPayload = Partial<RedeemVisitResponse> & {
  success?: boolean;
  message?: string;
};

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

const parseResponsePayload = async (response: Response): Promise<RedeemVisitPayload | null> => {
  const text = await response.text();

  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text) as RedeemVisitPayload;
  } catch {
    return null;
  }
};

const normalizeRedeemResponse = (payload: RedeemVisitPayload | null): RedeemVisitResponse => ({
  visitCreated: Boolean(payload?.visitCreated ?? payload?.success ?? true),
  couponGenerated: Boolean(payload?.couponGenerated),
});

const redeemVisitQr = async (
  token: string,
  userId: number,
  options?: { signal?: AbortSignal; regenerateDynamicQr?: boolean },
) => {
  const response = await fetch(`${URL}visits/qr/redeem`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, userId, regenerateDynamicQr: options?.regenerateDynamicQr ?? true }),
    signal: options?.signal,
  });
  
  const payload = await parseResponsePayload(response);
  console.log("Respuesta del canje de visita:", { status: response.status, payload });
  if (!response.ok) {
    const hasSuccessSignal = payload?.visitCreated || payload?.couponGenerated || payload?.success;

    if (hasSuccessSignal) {
      return normalizeRedeemResponse(payload);
    }

    throw new Error(payload?.message || "No se pudo registrar la visita.");
  }

  return normalizeRedeemResponse(payload);
};

export { getVisitsByUserId, getVisitHistoryByUserId, redeemVisitQr };
