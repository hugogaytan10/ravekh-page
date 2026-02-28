import { URL } from "../Const/Const";
import type { Coupon, Visit } from "./types";

type GenerateVisitQrPayload = {
  businessId: number;
  quantity: number;
  ttlMinutes: number;
  domain: string;
};

type GenerateDynamicVisitQrPayload = {
  businessId: number;
  domain: string;
};

type VisitQrTokenItem = {
  token?: string;
  qr?: string;
  url?: string;
  [key: string]: unknown;
};

export type GenerateVisitQrResponse = {
  tokens: VisitQrTokenItem[];
  [key: string]: unknown;
};

export type DynamicVisitQrToken = {
  token?: string;
  qrUrl?: string;
  refreshAfterSeconds?: number;
  [key: string]: unknown;
};

type CouponResponseShape = {
  coupon?: Coupon;
  newCoupon?: Coupon;
  createdCoupon?: Coupon;
  updatedCoupon?: Coupon;
  data?: unknown;
  message?: string;
};

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

export const getCouponByBusinessAndQR = async (
  businessId: number,
  qrCode: string,
  token?: string,
): Promise<Coupon> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${URL}coupons/business/${businessId}/qr/${encodeURIComponent(qrCode)}`,
    {
      method: 'GET',
      headers,
    },
  );

  const data = await response.json();

  console.log('[Coupons][getCouponByBusinessAndQR] status/data:', {
    status: response.status,
    ok: response.ok,
    businessId,
    qrCode,
    data,
  });

  if (!response.ok) {
    const reason = [data?.message, data?.error].filter(Boolean).join(' - ');
    throw new Error(reason || 'No se encontró el cupón.');
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

  console.log('[Coupons][getCouponByBusinessAndQR] normalized coupon:', {
    normalizedCoupon,
    extractedId:
      (normalizedCoupon as Coupon & {id?: number; couponId?: number}).Id ??
      (normalizedCoupon as Coupon & {id?: number; couponId?: number}).id ??
      (normalizedCoupon as Coupon & {id?: number; couponId?: number}).couponId,
  });

  return normalizedCoupon as Coupon;
};

const normalizeCouponResponse = (data: unknown): Coupon | null => {
  const payload = data as CouponResponseShape | null;
  const normalizedCoupon =
    payload?.coupon ??
    payload?.newCoupon ??
    payload?.createdCoupon ??
    (payload?.data as CouponResponseShape | undefined)?.coupon ??
    (payload?.data as CouponResponseShape | undefined)?.newCoupon ??
    (payload?.data as CouponResponseShape | undefined)?.createdCoupon ??
    payload?.data ??
    payload;

  if (typeof normalizedCoupon === "number" && Number.isFinite(normalizedCoupon) && normalizedCoupon > 0) {
    return { Id: normalizedCoupon, Business_Id: 0, QR: "", Description: "", LimitUsers: 0 };
  }

  if (normalizedCoupon && typeof normalizedCoupon === "object") {
    return normalizedCoupon as Coupon;
  }

  return null;
};

export const createCoupon = async (coupon: Coupon, token?: string): Promise<Coupon> => {
  const headers = buildHeaders(token);

  const response = await fetch(`${URL}coupons`, {
    method: "POST",
    headers,
    body: JSON.stringify(coupon),
  });

  const data = (await response.json()) as CouponResponseShape | number | null;

  if (!response.ok) {
    throw new Error((data as CouponResponseShape | null)?.message || "No se pudo crear el cupón.");
  }

  const normalizedCoupon = normalizeCouponResponse(data);

  if (typeof normalizedCoupon?.Id === "number" && normalizedCoupon.Id > 0 && !normalizedCoupon.QR) {
    return { ...coupon, Id: normalizedCoupon.Id };
  }

  return normalizedCoupon ?? coupon;
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

  const data = (await response.json()) as CouponResponseShape | null;

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo actualizar el cupón.");
  }

  return (data?.coupon || data?.updatedCoupon || (data?.data as CouponResponseShape | undefined)?.coupon || data) as Coupon;
};

export const getCouponsByBusiness = async (businessId: number, token?: string): Promise<Coupon[]> => {
  const headers = buildHeaders(token);

  const response = await fetch(`${URL}coupons/business/${businessId}`, {
    method: "GET",
    headers,
  });

  const data = (await response.json()) as CouponResponseShape | Coupon[] | null;

  if (!response.ok) {
    throw new Error((data as CouponResponseShape | null)?.message || "No se pudieron cargar los cupones.");
  }

  const normalized =
    (data as CouponResponseShape | null)?.data && Array.isArray((data as CouponResponseShape).data)
      ? ((data as CouponResponseShape).data as Coupon[])
      : ((data as CouponResponseShape | null)?.data as CouponResponseShape | undefined)?.coupon &&
          Array.isArray(((data as CouponResponseShape).data as CouponResponseShape).coupon)
        ? ((((data as CouponResponseShape).data as CouponResponseShape).coupon as unknown) as Coupon[])
        : (data as CouponResponseShape | null)?.data &&
            Array.isArray((data as CouponResponseShape).data)
          ? ((data as CouponResponseShape).data as Coupon[])
          : ((data as CouponResponseShape | null)?.data as Coupon[] | undefined) ??
            ((data as Coupon[] | null) ?? []);

  if (Array.isArray((data as CouponResponseShape | null)?.coupons)) {
    return (data as CouponResponseShape & { coupons: Coupon[] }).coupons;
  }

  return Array.isArray(normalized) ? normalized : [];
};

export const getCouponById = async (couponId: number, token?: string): Promise<Coupon | null> => {
  const headers = buildHeaders(token);

  const response = await fetch(`${URL}coupons/${couponId}`, {
    method: "GET",
    headers,
  });

  const data = (await response.json()) as CouponResponseShape | Coupon | null;

  if (!response.ok) {
    throw new Error((data as CouponResponseShape | null)?.message || "No se pudo cargar el cupón.");
  }

  const normalized =
    (data as CouponResponseShape | null)?.coupon ??
    ((data as CouponResponseShape | null)?.data as CouponResponseShape | undefined)?.coupon ??
    (data as CouponResponseShape | null)?.data ??
    data;

  return normalized && typeof normalized === "object" ? (normalized as Coupon) : null;
};

export const deleteCoupon = async (couponId: number, token?: string): Promise<void> => {
  const headers = buildHeaders(token);

  const response = await fetch(`${URL}coupons/${couponId}`, {
    method: "DELETE",
    headers,
  });

  const data = (await response.json()) as CouponResponseShape | null;

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo eliminar el cupón.");
  }
};

export const redeemCouponForUser = async (
  couponId: number,
  userId: number,
  token?: string,
) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${URL}couponhasusers/coupon/${couponId}/user/${userId}`,
    {
      method: 'PUT',
      headers,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    const reason = [data?.message, data?.error].filter(Boolean).join(' - ');
    throw new Error(reason || 'No se pudo usar el cupón.');
  }

  return data;
};

export const generateVisitQrTokens = async (
  payload: GenerateVisitQrPayload,
  token?: string,
): Promise<GenerateVisitQrResponse> => {
  const headers = buildHeaders(token);

  const response = await fetch(`${URL}visits/qr/generate`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as
    | (GenerateVisitQrResponse & { message?: string; error?: string; data?: GenerateVisitQrResponse })
    | null;

  if (!response.ok) {
    const reason = [data?.message, data?.error].filter(Boolean).join(" - ");
    throw new Error(reason || "No se pudieron generar los códigos QR de visita.");
  }

  const normalized =
    data?.tokens && Array.isArray(data.tokens)
      ? data
      : data?.data?.tokens && Array.isArray(data.data.tokens)
        ? data.data
        : { tokens: [] };

  return normalized;
};

export const generateDynamicVisitQr = async (
  payload: GenerateDynamicVisitQrPayload,
  token?: string,
): Promise<DynamicVisitQrToken> => {
  const headers = buildHeaders(token);

  const response = await fetch(`${URL}visits/qr/dynamic/next`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as
    | (DynamicVisitQrToken & { message?: string; error?: string; data?: DynamicVisitQrToken })
    | null;

  if (!response.ok) {
    const reason = [data?.message, data?.error].filter(Boolean).join(" - ");
    throw new Error(reason || "No se pudo generar el QR dinámico.");
  }

  const normalized =
    data?.qrUrl
      ? data
      : data?.data?.qrUrl
        ? data.data
        : null;

  if (!normalized?.qrUrl) {
    throw new Error("No se recibió un QR dinámico válido.");
  }

  return normalized;
};


export const getVisitsByBusiness = async (
  businessId: number,
  token?: string,
): Promise<Visit[]> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${URL}visits/business/${businessId}`, {
    method: "GET",
    headers,
  });

  const data = (await response.json().catch(() => null)) as
    | { message?: string; visits?: Visit[]; data?: { visits?: Visit[] } | Visit[] }
    | Visit[]
    | null;

  if (!response.ok) {
    throw new Error((data as { message?: string } | null)?.message || "No se pudieron obtener las visitas.");
  }

  if (Array.isArray(data)) {
    return data as Visit[];
  }

  if (Array.isArray(data?.visits)) {
    return data.visits;
  }

  if (Array.isArray(data?.data)) {
    return data.data as Visit[];
  }

  if (Array.isArray((data?.data as { visits?: Visit[] } | undefined)?.visits)) {
    return (data?.data as { visits: Visit[] }).visits;
  }

  return [];
};
