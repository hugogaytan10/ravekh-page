import { getPosApiBaseUrl } from "./posEnv";

export type PosFeatureLevel = 0 | 1 | 2;

export type PosBusinessFeatures = {
  pos: PosFeatureLevel | null;
  catalog: PosFeatureLevel | null;
  fidelity: PosFeatureLevel | null;
  plan: string | null;
};

export type PosFeatureKey = "pos" | "catalog" | "fidelity";

type BusinessFeaturesResponse = {
  Pos?: unknown;
  pos?: unknown;
  Catalog?: unknown;
  catalog?: unknown;
  Fidelity?: unknown;
  fidelity?: unknown;
};

export type PosBusinessFeatureResponse = {
  Plan?: unknown;
  plan?: unknown;
  CouponsPlan?: unknown;
  couponsPlan?: unknown;
  Features?: BusinessFeaturesResponse | null;
  features?: BusinessFeaturesResponse | null;
  data?: unknown;
  Data?: unknown;
  business?: unknown;
  Business?: unknown;
};

export const POS_FEATURES_UNKNOWN: PosBusinessFeatures = {
  pos: null,
  catalog: null,
  fidelity: null,
  plan: null,
};

export const normalizePosFeatureLevel = (value: unknown): PosFeatureLevel | null => {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  if (parsed >= 2) return 2;
  if (parsed >= 1) return 1;
  return 0;
};

const unwrapPosBusinessFeatureResponse = (payload: unknown): PosBusinessFeatureResponse | null => {
  if (!payload) return null;
  if (Array.isArray(payload)) return unwrapPosBusinessFeatureResponse(payload[0]);
  if (typeof payload !== "object") return null;

  const record = payload as PosBusinessFeatureResponse;
  if (record.Plan != null || record.plan != null || record.Features != null || record.features != null) return record;

  return unwrapPosBusinessFeatureResponse(record.business ?? record.Business ?? record.data ?? record.Data);
};

export const readPosBusinessFeatures = (payload?: PosBusinessFeatureResponse | null): PosBusinessFeatures => {
  const business = unwrapPosBusinessFeatureResponse(payload);
  if (!business) return POS_FEATURES_UNKNOWN;

  return {
    pos: normalizePosFeatureLevel(business.Features?.Pos ?? business.features?.pos),
    catalog: normalizePosFeatureLevel(business.Features?.Catalog ?? business.features?.catalog),
    fidelity: normalizePosFeatureLevel(
      business.Features?.Fidelity ?? business.features?.fidelity ?? business.CouponsPlan ?? business.couponsPlan,
    ),
    plan: String(business.Plan ?? business.plan ?? "").trim() || null,
  };
};

export const isPosFeatureBlocked = (value: PosFeatureLevel | null | undefined): boolean => value === 0;

export const isOfflinePosPlan = (plan: string | null | undefined): boolean => String(plan ?? "").trim().toUpperCase() === "OFFLINE";

export const isPosModuleBlocked = (features: PosBusinessFeatures): boolean => isOfflinePosPlan(features.plan) || isPosFeatureBlocked(features.pos);

export const fetchPosBusinessFeatures = async (businessId: number, token: string, apiBaseUrl = getPosApiBaseUrl()): Promise<PosBusinessFeatures> => {
  if (!businessId || !token) return POS_FEATURES_UNKNOWN;

  const response = await fetch(new URL(`business/${businessId}`, apiBaseUrl).toString(), {
    headers: {
      "Content-Type": "application/json",
      token,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error(`No se pudo validar el negocio (${response.status}).`);
  const payload = await response.json() as PosBusinessFeatureResponse;
  const features = readPosBusinessFeatures(payload);
  console.info("POS acceso: negocio validado.", { businessId, plan: features.plan, pos: features.pos });
  return features;
};
