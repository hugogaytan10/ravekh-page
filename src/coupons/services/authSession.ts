import {
  setCuponesBusinessId,
  setCuponesSession,
  setCuponesToken,
  setCuponesUserId,
  setCuponesUserName,
} from "./session";

type CuponesAuthPayload = {
  Id?: number | string;
  id?: number | string;
  Business_Id?: number | string;
  businessId?: number | string;
  Name?: string;
  name?: string;
  Role?: string;
  role?: string;
  Token?: string;
  token?: string;
};

const parseNumericId = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
};

const persistCuponesAuthSession = (payload: CuponesAuthPayload): { role: string; userId: number } => {
  const role = (payload.Role ?? payload.role ?? "").trim();
  const userId = parseNumericId(payload.Id ?? payload.id);
  const businessId = parseNumericId(payload.Business_Id ?? payload.businessId);
  const userName = (payload.Name ?? payload.name ?? "").trim();
  const token = (payload.Token ?? payload.token ?? "").trim();

  if (!role || !userId) {
    throw new Error("No encontramos la información necesaria para iniciar tu sesión.");
  }

  setCuponesSession(true);
  setCuponesUserId(userId);
  setCuponesUserName(userName);
  setCuponesBusinessId(businessId ?? undefined);
  setCuponesToken(token);
  localStorage.setItem("cupones-role", role);

  return { role, userId };
};

export { parseNumericId, persistCuponesAuthSession };
export type { CuponesAuthPayload };

