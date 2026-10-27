import { IPendingPaymentsRepository } from "../interface/IPendingPaymentsRepository";
import { PendingAccount, PendingAccountDetail, PendingPaymentRecord, validatePendingPayment } from "../model/PendingPayment";

export class PendingPaymentsService {
  constructor(private readonly repository: IPendingPaymentsRepository) {}

  listAccounts(businessId: number, token: string): Promise<PendingAccount[]> {
    return this.repository.listAccounts(businessId, token);
  }

  getAccount(orderId: number, token: string): Promise<PendingAccountDetail> {
    return this.repository.getAccount(orderId, token);
  }

  createPayment(orderId: number, payment: number, available: number, token: string): Promise<PendingPaymentRecord> {
    this.assertPayment(payment, available);
    return this.repository.createPayment(orderId, payment, token);
  }

  updatePayment(paymentId: number, payment: number, available: number, token: string): Promise<PendingPaymentRecord> {
    this.assertPayment(payment, available);
    return this.repository.updatePayment(paymentId, payment, token);
  }

  deletePayment(paymentId: number, token: string): Promise<void> {
    return this.repository.deletePayment(paymentId, token);
  }

  private assertPayment(payment: number, available: number): void {
    const validation = validatePendingPayment(payment, available);
    if (validation) throw new Error(validation);
  }
}
