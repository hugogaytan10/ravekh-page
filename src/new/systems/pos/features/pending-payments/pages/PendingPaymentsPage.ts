import { PendingPaymentsService } from "../services/PendingPaymentsService";

export class PendingPaymentsPage {
  constructor(private readonly service: PendingPaymentsService) {}

  list(businessId: number, token: string) {
    return this.service.listAccounts(businessId, token);
  }

  detail(orderId: number, token: string) {
    return this.service.getAccount(orderId, token);
  }

  createPayment(orderId: number, payment: number, available: number, token: string) {
    return this.service.createPayment(orderId, payment, available, token);
  }

  updatePayment(paymentId: number, payment: number, available: number, token: string) {
    return this.service.updatePayment(paymentId, payment, available, token);
  }

  deletePayment(paymentId: number, token: string) {
    return this.service.deletePayment(paymentId, token);
  }
}
