import { readPosSessionSnapshot } from "./posSession";

export const POS_CURRENCIES = [
  { id: 1, code: "MXN", label: "Peso mexicano", iso: "MXN" },
  { id: 2, code: "USD", label: "Dólar estadounidense", iso: "USD" },
  { id: 3, code: "BNY", label: "Yuan chino", iso: "CNY" },
  { id: 4, code: "EUR", label: "Euro", iso: "EUR" },
] as const;
export const resolvePosCurrency = (value: unknown) =>
  POS_CURRENCIES.find(item => item.code === String(value).toUpperCase() || item.iso === String(value).toUpperCase() || item.id === Number(value)) ?? POS_CURRENCIES[0];
const key = (businessId: number) => `pos-v2-currency/${businessId}`;
export const readPosCurrency = () => {
  try { return resolvePosCurrency(window.localStorage.getItem(key(readPosSessionSnapshot().businessId))); }
  catch { return POS_CURRENCIES[0]; }
};
export const persistPosCurrency = (businessId: number, value: unknown) => {
  window.localStorage.setItem(key(businessId), resolvePosCurrency(value).code);
};
export const posMoneyFormatter = {
  format: (value: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: readPosCurrency().iso, maximumFractionDigits: 2 }).format(value),
};
