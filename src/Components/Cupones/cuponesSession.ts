const SESSION_KEY = "cupones-session";
const USER_NAME_KEY = "cupones-name";

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

export { getCuponesUserName, hasCuponesSession, setCuponesSession, setCuponesUserName };
export default hasCuponesSession;
