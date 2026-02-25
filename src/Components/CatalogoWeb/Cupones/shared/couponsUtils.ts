const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const randomChunk = (length: number): string =>
  Array.from({ length }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("");

export const buildQrCode = (): string => `QR-${randomChunk(5)}-${randomChunk(4)}`;

const pad = (value: number): string => String(value).padStart(2, "0");

export const formatDateTime = (date: Date): string => {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const toDatetimeLocalValue = (date: Date): string => {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const mergeDateAndTime = (date: Date): string => toDatetimeLocalValue(date);

export const getCouponId = (coupon?: any): number | null => {
  if (!coupon) return null;
  if (typeof coupon === "number") return Number.isFinite(coupon) && coupon > 0 ? coupon : null;

  const raw = coupon?.Id ?? coupon?.id ?? coupon?.couponId;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
};
