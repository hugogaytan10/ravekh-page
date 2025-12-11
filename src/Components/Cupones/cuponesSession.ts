const SESSION_KEY = "cupones-session";

const setCuponesSession = (isActive: boolean) => {
  if (isActive) {
    localStorage.setItem(SESSION_KEY, "true");
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
};

const hasCuponesSession = () => localStorage.getItem(SESSION_KEY) === "true";

export { hasCuponesSession, setCuponesSession };
export default hasCuponesSession;
