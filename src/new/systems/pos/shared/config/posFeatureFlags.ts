import { getPosApiBaseUrl } from "./posEnv";

export type PosFeatureLevel = 0 | 1 | 2;

export type PosBusinessFeatures = {
  pos: PosFeatureLevel | null;
  catalog: PosFeatureLevel | null;
  fidelity: PosFeatureLevel | null;
};

type BusinessFeaturesResponse = {
  Pos?: unknown;
  pos?: unknown;
  Catalog?: unknown;
  catalog?: unknown;
  Fidelity?: unknown;
  fidelity?: unknown;
};

export type PosBusinessFeatureResponse = {
  CouponsPlan?: unknown;
  couponsPlan?: unknown;
  Features?: BusinessFeaturesResponse | null;
  features?: BusinessFeaturesResponse | null;
};

export const POS_FEATURES_UNKNOWN: PosBusinessFeatures = {
  pos: null,
  catalog: null,
  fidelity: null,
};

export const normalizePosFeatureLevel = (value: unknown): PosFeatureLevel | null => {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  if (parsed >= 2) return 2;
  if (parsed >= 1) return 1;
  return 0;
};

export const readPosBusinessFeatures = (business?: PosBusinessFeatureResponse | null): PosBusinessFeatures => {
  if (!business) return POS_FEATURES_UNKNOWN;

  return {
    pos: normalizePosFeatureLevel(business.Features?.Pos ?? business.features?.pos),
    catalog: normalizePosFeatureLevel(business.Features?.Catalog ?? business.features?.catalog),
    fidelity: normalizePosFeatureLevel(
      business.Features?.Fidelity ?? business.features?.fidelity ?? business.CouponsPlan ?? business.couponsPlan,
    ),
  };
};

export const isPosFeatureBlocked = (value: PosFeatureLevel | null | undefined): boolean => value === 0;

export const fetchPosBusinessFeatures = async (businessId: number, token: string, apiBaseUrl = getPosApiBaseUrl()): Promise<PosBusinessFeatures> => {
  if (!businessId || !token) return POS_FEATURES_UNKNOWN;

  const response = await fetch(new URL(`business/${businessId}`, apiBaseUrl).toString(), {
    headers: {
      "Content-Type": "application/json",
      token,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) return POS_FEATURES_UNKNOWN;
  const payload = (await response.json()) as PosBusinessFeatureResponse;
  return readPosBusinessFeatures(payload);
};
