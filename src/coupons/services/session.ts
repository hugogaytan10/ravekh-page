const isValidNumericId = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

const SESSION_KEY = "cupones-session";
const USER_NAME_KEY = "cupones-name";
const USER_ID_KEY = "cupones-user-id";
const BUSINESS_ID_KEY = "cupones-business-id";
const TOKEN_KEY = "cupones-token";
const PENDING_VISIT_TOKEN_KEY = "cupones-pending-visit-token";

const setCuponesSession = (isActive: boolean) => {
  if (isActive) {
    localStorage.setItem(SESSION_KEY, "true");
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
};

const hasCuponesSession = () => localStorage.getItem(SESSION_KEY) === "true";

const setCuponesUserName = (name: string) => {
  if (name) {
    localStorage.setItem(USER_NAME_KEY, name);
  } else {
    localStorage.removeItem(USER_NAME_KEY);
  }
};

const getCuponesUserName = () => localStorage.getItem(USER_NAME_KEY) ?? "";

const setCuponesUserId = (userId?: number) => {
  if (isValidNumericId(userId)) {
    localStorage.setItem(USER_ID_KEY, String(userId));
  } else {
    localStorage.removeItem(USER_ID_KEY);
  }
};

const getCuponesUserId = () => {
  const value = localStorage.getItem(USER_ID_KEY);
  const parsed = value ? Number(value) : NaN;
  return isValidNumericId(parsed) ? parsed : null;
};

const setCuponesBusinessId = (businessId?: number) => {
  if (isValidNumericId(businessId)) {
    localStorage.setItem(BUSINESS_ID_KEY, String(businessId));
  } else {
    localStorage.removeItem(BUSINESS_ID_KEY);
  }
};

const getCuponesBusinessId = () => {
  const value = localStorage.getItem(BUSINESS_ID_KEY);
  const parsed = value ? Number(value) : NaN;
  return isValidNumericId(parsed) ? parsed : null;
};

const setCuponesToken = (token?: string) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

const getCuponesToken = () => localStorage.getItem(TOKEN_KEY) ?? "";

const setPendingVisitRedeemToken = (token?: string) => {
  const normalizedToken = token?.trim();

  if (normalizedToken) {
    localStorage.setItem(PENDING_VISIT_TOKEN_KEY, normalizedToken);
  } else {
    localStorage.removeItem(PENDING_VISIT_TOKEN_KEY);
  }
};

const getPendingVisitRedeemToken = () => localStorage.getItem(PENDING_VISIT_TOKEN_KEY) ?? "";

const clearPendingVisitRedeemToken = () => {
  localStorage.removeItem(PENDING_VISIT_TOKEN_KEY);
};

export {
  clearPendingVisitRedeemToken,
  getCuponesBusinessId,
  getCuponesToken,
  getCuponesUserId,
  getCuponesUserName,
  getPendingVisitRedeemToken,
  hasCuponesSession,
  setPendingVisitRedeemToken,
  setCuponesBusinessId,
  setCuponesSession,
  setCuponesToken,
  setCuponesUserId,
  setCuponesUserName,
};
export default hasCuponesSession;
