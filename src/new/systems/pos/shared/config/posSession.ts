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


export type PosOperatorRole = "admin" | "manager" | "staff" | "unknown";

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  if (!token || !token.includes(".")) return null;
  const segments = token.split(".");
  if (segments.length < 2) return null;

  try {
    const payload = segments[1].replace(/-/g, "+").replace(/_/g, "/");
    const normalized = payload.padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const decoded = atob(normalized);
    const parsed = JSON.parse(decoded) as Record<string, unknown>;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

const normalizeRole = (value: unknown): PosOperatorRole => {
  const normalized = String(value ?? "").toLowerCase().trim();

  if (!normalized) return "unknown";
  if (normalized.includes("admin") || normalized.includes("administrador") || normalized.includes("owner") || normalized.includes("due")) {
    return "admin";
  }

  if (normalized.includes("gerente") || normalized.includes("manager")) {
    return "manager";
  }

  if (normalized.includes("staff") || normalized.includes("ayud") || normalized.includes("cashier") || normalized.includes("cajer")) {
    return "staff";
  }

  return "unknown";
};

export const resolvePosOperatorRole = (token: string): PosOperatorRole => {
  const payload = decodeJwtPayload(token);
  if (!payload) return "unknown";

  const ownerFlag = payload.isOwner ?? payload.IsOwner;
  if (ownerFlag === true || ownerFlag === 1 || ownerFlag === "1") {
    return "admin";
  }

  return normalizeRole(payload.role ?? payload.Role ?? payload.typeUser ?? payload.TypeUser);
};

export const isSalesOnlyOperator = (token: string): boolean => resolvePosOperatorRole(token) === "staff";

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
