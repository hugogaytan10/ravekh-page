export type PendingPaymentRecord = {
  id: number;
  customerId: number;
  orderId: number;
  payment: number;
  date: string;
};

export type PendingAccount = {
  orderId: number;
  customerId: number;
  customerName: string;
  date: string;
  status: string;
  currency: string;
  total: number;
  paid: number;
  balance: number;
};

export type PendingAccountDetail = PendingAccount & {
  payments: PendingPaymentRecord[];
};

export const validatePendingPayment = (payment: number, available: number): string | null => {
  if (!Number.isFinite(payment) || payment <= 0) return "Ingresa un abono mayor a cero.";
  if (payment > available) return "El abono no puede superar el saldo pendiente.";
  return null;
};
