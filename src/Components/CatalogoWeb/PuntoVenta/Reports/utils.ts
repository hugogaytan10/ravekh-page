export const normalizePeriodLabel = (period?: string | null) => {
  if (!period) return "Día";

  const normalized = period.trim().toLowerCase();
  if (normalized === "dia" || normalized === "día") return "Día";
  if (normalized === "mes") return "Mes";
  if (normalized === "ano" || normalized === "año") return "Año";
  return "Día";
};

export const resolveBusinessId = (businessIdFromContext?: number | null) => {
  if (businessIdFromContext && Number.isFinite(businessIdFromContext)) {
    return String(businessIdFromContext);
  }

  if (typeof window === "undefined") return null;
  const storedUser = window.localStorage.getItem("user");
  if (!storedUser) return null;

  try {
    const parsed = JSON.parse(storedUser);
    const candidate = parsed?.Business_Id;
    if (candidate != null && Number.isFinite(Number(candidate))) {
      return String(candidate);
    }
    return null;
  } catch {
    return null;
  }
};
