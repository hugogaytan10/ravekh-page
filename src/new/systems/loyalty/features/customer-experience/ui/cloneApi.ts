import { getPosApiBaseUrl } from "../../../../pos/shared/config/posEnv";

const API_BASE = getPosApiBaseUrl();

const parsePayload = async <T>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const throwApiError = async (response: Response, fallback: string): Promise<never> => {
  const payload = await parsePayload<{ message?: string; Message?: string }>(response);
  throw new Error(payload?.message || payload?.Message || fallback);
};

export const registerLoyaltyCustomer = async (name: string, email: string, password: string) => {
  const response = await fetch(`${API_BASE}employee`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Role: "CLIENTE", Name: name, Email: email, Password: password }),
  });
  if (!response.ok) await throwApiError(response, "No se pudo registrar la cuenta.");
  return parsePayload<{ Id?: number; id?: number; message?: string }>(response);
};

export const resetLoyaltyPassword = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE}resetpassword`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Email: email, Password: password }),
  });
  if (!response.ok) await throwApiError(response, "No se pudo restablecer la contraseña.");
  return parsePayload<{ message?: string }>(response);
};

export const renameLoyaltyCustomer = async (id: number, name: string) => {
  const response = await fetch(`${API_BASE}employee/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Name: name }),
  });
  if (!response.ok) await throwApiError(response, "No se pudo actualizar el nombre.");
};

export const deleteLoyaltyCustomer = async (id: number, token?: string) => {
  const response = await fetch(`${API_BASE}employee/${id}`, {
    method: "DELETE",
    headers: token ? { "Content-Type": "application/json", token } : undefined,
  });
  if (!response.ok) await throwApiError(response, "No se pudo eliminar la cuenta.");
};

export const redeemVisitByAdmin = async (token: string, userId: number) => {
  const response = await fetch(`${API_BASE}visits/qr/redeem`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, userId }),
  });
  if (!response.ok) await throwApiError(response, "No se pudo registrar la visita.");
  return parsePayload<{ visitCreated?: boolean; couponGenerated?: boolean; message?: string }>(response);
};
