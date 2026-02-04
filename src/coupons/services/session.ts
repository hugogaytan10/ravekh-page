const SESSION_KEY = "cupones-session";
const USER_NAME_KEY = "cupones-name";
const USER_ID_KEY = "cupones-user-id";
const BUSINESS_ID_KEY = "cupones-business-id";

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
  if (userId) {
    localStorage.setItem(USER_ID_KEY, String(userId));
  } else {
    localStorage.removeItem(USER_ID_KEY);
  }
};

const getCuponesUserId = () => {
  const value = localStorage.getItem(USER_ID_KEY);
  return value ? Number(value) : null;
};

const setCuponesBusinessId = (businessId?: number) => {
  if (businessId) {
    localStorage.setItem(BUSINESS_ID_KEY, String(businessId));
  } else {
    localStorage.removeItem(BUSINESS_ID_KEY);
  }
};

const getCuponesBusinessId = () => {
  const value = localStorage.getItem(BUSINESS_ID_KEY);
  return value ? Number(value) : null;
};

export {
  getCuponesBusinessId,
  getCuponesUserId,
  getCuponesUserName,
  hasCuponesSession,
  setCuponesBusinessId,
  setCuponesSession,
  setCuponesUserId,
  setCuponesUserName,
};
export default hasCuponesSession;
