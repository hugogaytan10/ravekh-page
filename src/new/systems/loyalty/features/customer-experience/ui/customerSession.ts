import type { LoyaltyCustomerProfile } from "../model/LoyaltyCustomer";

const SESSION_KEY = "v2_loyalty_customer_profile";

export const writeLoyaltyCustomerSession = (profile: LoyaltyCustomerProfile) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
};

export const readLoyaltyCustomerSession = (): LoyaltyCustomerProfile | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<LoyaltyCustomerProfile>;
    const id = Number(parsed.id ?? 0);
    if (!Number.isFinite(id) || id <= 0) return null;
    return {
      id,
      name: String(parsed.name ?? `Cliente ${id}`),
      email: parsed.email,
    };
  } catch {
    return null;
  }
};

export const clearLoyaltyCustomerSession = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
};
