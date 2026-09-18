export const POS_BRANCH_STORAGE_KEYS = {
  activeBranchId: "pos-v2-branch-id",
  activeBranchName: "pos-v2-branch-name",
  activeBranchSlug: "pos-v2-branch-slug",
  businessId: "pos-v2-branch-business-id",
} as const;

export const POS_BRANCH_UPDATED_EVENT = "ravekh:pos-branch-updated";

export type PosBranch = {
  id: number;
  businessId: number;
  name: string;
  code: string;
  slug: string;
  phoneNumber: string | null;
  whatsApp: string | null;
  address: string | null;
  references: string | null;
  isMain: boolean;
  catalogEnabled: boolean;
  active: boolean;
};

export type PosBranchSnapshot = {
  branchId: number;
  businessId: number;
  name: string;
  slug: string;
};

const safeGet = (key: string): string => {
  try {
    return (window.localStorage.getItem(key) ?? "").trim();
  } catch {
    return "";
  }
};

const safeSet = (key: string, value: string): void => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // localStorage can be unavailable in private/constrained contexts.
  }
};

const safeRemove = (key: string): void => {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore storage failures
  }
};

export const readPosBranchSnapshot = (): PosBranchSnapshot => {
  const branchId = Number(safeGet(POS_BRANCH_STORAGE_KEYS.activeBranchId));
  const businessId = Number(safeGet(POS_BRANCH_STORAGE_KEYS.businessId));

  return {
    branchId: Number.isInteger(branchId) && branchId > 0 ? branchId : 0,
    businessId: Number.isInteger(businessId) && businessId > 0 ? businessId : 0,
    name: safeGet(POS_BRANCH_STORAGE_KEYS.activeBranchName),
    slug: safeGet(POS_BRANCH_STORAGE_KEYS.activeBranchSlug),
  };
};

export const readActivePosBranchId = (businessId?: number): number => {
  const snapshot = readPosBranchSnapshot();
  if (businessId && snapshot.businessId && snapshot.businessId !== businessId) {
    return 0;
  }
  return snapshot.branchId;
};

export const persistPosBranch = (branch: PosBranch): void => {
  safeSet(POS_BRANCH_STORAGE_KEYS.activeBranchId, String(branch.id));
  safeSet(POS_BRANCH_STORAGE_KEYS.businessId, String(branch.businessId));
  safeSet(POS_BRANCH_STORAGE_KEYS.activeBranchName, branch.name);
  safeSet(POS_BRANCH_STORAGE_KEYS.activeBranchSlug, branch.slug);

  window.dispatchEvent(
    new CustomEvent<PosBranch>(POS_BRANCH_UPDATED_EVENT, {
      detail: branch,
    }),
  );
};

export const clearPosBranchSelection = (): void => {
  safeRemove(POS_BRANCH_STORAGE_KEYS.activeBranchId);
  safeRemove(POS_BRANCH_STORAGE_KEYS.businessId);
  safeRemove(POS_BRANCH_STORAGE_KEYS.activeBranchName);
  safeRemove(POS_BRANCH_STORAGE_KEYS.activeBranchSlug);
};

export const onPosBranchUpdated = (listener: (branch: PosBranch) => void): (() => void) => {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<PosBranch>;
    if (customEvent.detail) listener(customEvent.detail);
  };

  window.addEventListener(POS_BRANCH_UPDATED_EVENT, handler);
  return () => window.removeEventListener(POS_BRANCH_UPDATED_EVENT, handler);
};

export const buildPosAuthHeaders = (
  token: string,
  options: {
    contentType?: boolean;
    branchId?: number;
    skipBranch?: boolean;
  } = {},
): Record<string, string> => {
  const headers: Record<string, string> = {};

  if (options.contentType !== false) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.token = token;
    headers.Authorization = `Bearer ${token}`;
  }

  if (!options.skipBranch) {
    const branchId = options.branchId ?? readActivePosBranchId();
    if (Number.isInteger(branchId) && branchId > 0) {
      headers["X-Branch-Id"] = String(branchId);
    }
  }

  return headers;
};

