import { PendingAccount, PendingAccountDetail, PendingPaymentRecord } from "../model/PendingPayment";

export interface IPendingPaymentsRepository {
  listAccounts(businessId: number, token: string): Promise<PendingAccount[]>;
  getAccount(orderId: number, token: string): Promise<PendingAccountDetail>;
  createPayment(orderId: number, payment: number, token: string): Promise<PendingPaymentRecord>;
  updatePayment(paymentId: number, payment: number, token: string): Promise<PendingPaymentRecord>;
  deletePayment(paymentId: number, token: string): Promise<void>;
}
