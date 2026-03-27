export const POS_SESSION_STORAGE_KEYS = {
  token: "pos-v2-token",
  businessId: "pos-v2-business-id",
  employeeId: "pos-v2-employee-id",
  moreFavorites: "pos-v2-more-favorites",
} as const;

export type PosSessionSnapshot = {
  token: string;
  businessId: number;
  employeeId: number;
};

const safeGet = (key: string): string => {
  try {
    return (window.localStorage.getItem(key) ?? "").trim();
  } catch {
    return "";
  }
};

export const readPosSessionSnapshot = (): PosSessionSnapshot => {
  const token = safeGet(POS_SESSION_STORAGE_KEYS.token);
  const businessId = Number(safeGet(POS_SESSION_STORAGE_KEYS.businessId));
  const employeeId = Number(safeGet(POS_SESSION_STORAGE_KEYS.employeeId));

  return {
    token,
    businessId: Number.isFinite(businessId) ? businessId : 0,
    employeeId: Number.isFinite(employeeId) ? employeeId : 0,
  };
};

export const clearPosSessionSnapshot = (): void => {
  try {
    window.localStorage.removeItem(POS_SESSION_STORAGE_KEYS.token);
    window.localStorage.removeItem(POS_SESSION_STORAGE_KEYS.businessId);
    window.localStorage.removeItem(POS_SESSION_STORAGE_KEYS.employeeId);
  } catch {
    // ignore localStorage failures in constrained environments
  }
};

export const readPosStringList = (key: string): string[] => {
  try {
    const stored = window.localStorage.getItem(key);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
};

export const writePosStringList = (key: string, values: string[]): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(values));
  } catch {
    // ignore localStorage failures in constrained environments
  }
};
