export const POS_SESSION_STORAGE_KEYS = {
  token: "pos-v2-token",
  businessId: "pos-v2-business-id",
  employeeId: "pos-v2-employee-id",
  email: "pos-v2-email",
  moreFavorites: "pos-v2-more-favorites",
} as const;

const POS_PENDING_UPGRADE_CONTEXT_KEY = "pos-v2-pending-upgrade-context";

export type PosPendingUpgradeContext = {
  token: string;
  businessId: number;
};

export type PosSessionSnapshot = {
  token: string;
  businessId: number;
  employeeId: number;
  email: string;
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
  const storedEmail = safeGet(POS_SESSION_STORAGE_KEYS.email);
  const tokenPayload = decodeJwtPayload(token);
  const tokenEmail = tokenPayload
    ? String(tokenPayload.email ?? tokenPayload.Email ?? tokenPayload.user ?? tokenPayload.User ?? "").trim()
    : "";

  return {
    token,
    businessId: Number.isFinite(businessId) ? businessId : 0,
    employeeId: Number.isFinite(employeeId) ? employeeId : 0,
    email: storedEmail || tokenEmail,
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

export const storePendingPosUpgradeContext = ({ token, businessId }: PosPendingUpgradeContext): void => {
  if (!token || !businessId) return;
  try {
    window.sessionStorage.setItem(POS_PENDING_UPGRADE_CONTEXT_KEY, JSON.stringify({ token, businessId }));
  } catch {
    // ignore sessionStorage failures in constrained environments
  }
};

export const readPendingPosUpgradeContext = (): PosPendingUpgradeContext | null => {
  try {
    const raw = window.sessionStorage.getItem(POS_PENDING_UPGRADE_CONTEXT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PosPendingUpgradeContext>;
    const token = String(parsed.token ?? "").trim();
    const businessId = Number(parsed.businessId);
    return token && Number.isFinite(businessId) && businessId > 0 ? { token, businessId } : null;
  } catch {
    return null;
  }
};

export const clearPendingPosUpgradeContext = (): void => {
  try {
    window.sessionStorage.removeItem(POS_PENDING_UPGRADE_CONTEXT_KEY);
  } catch {
    // ignore sessionStorage failures in constrained environments
  }
};

export const clearPosSessionSnapshot = (): void => {
  try {
    window.localStorage.removeItem(POS_SESSION_STORAGE_KEYS.token);
    window.localStorage.removeItem(POS_SESSION_STORAGE_KEYS.businessId);
    window.localStorage.removeItem(POS_SESSION_STORAGE_KEYS.employeeId);
    window.localStorage.removeItem(POS_SESSION_STORAGE_KEYS.email);
    window.localStorage.removeItem("plan");
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
