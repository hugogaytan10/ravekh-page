import { HttpClient } from "../../../../../core/api/HttpClient";
import { IPendingPaymentsRepository } from "../interface/IPendingPaymentsRepository";
import { PendingAccount, PendingAccountDetail, PendingPaymentRecord } from "../model/PendingPayment";

type ApiPayment = { Id?: unknown; Customer_Id?: unknown; Order_Id?: unknown; Payment?: unknown; Date?: unknown };
type ApiAccount = {
  Order_Id?: unknown; Customer_Id?: unknown; Customer_Name?: unknown; Date?: unknown; Status?: unknown;
  MoneyTipe?: unknown; Total?: unknown; Paid?: unknown; Balance?: unknown; Payments?: ApiPayment[];
};

const numberValue = (value: unknown): number => Number(value) || 0;
const textValue = (value: unknown, fallback = ""): string => String(value ?? fallback);

export class PosPendingPaymentsApi implements IPendingPaymentsRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async listAccounts(businessId: number, token: string): Promise<PendingAccount[]> {
    const rows = await this.httpClient.request<ApiAccount[]>({
      method: "GET",
      path: `pending-payments/business/${businessId}`,
      token,
    });
    return (Array.isArray(rows) ? rows : []).map(this.toAccount);
  }

  async getAccount(orderId: number, token: string): Promise<PendingAccountDetail> {
    const row = await this.httpClient.request<ApiAccount>({
      method: "GET",
      path: `pending-payments/order/${orderId}`,
      token,
    });
    return {
      ...this.toAccount(row),
      payments: Array.isArray(row.Payments) ? row.Payments.map(this.toPayment) : [],
    };
  }

  async createPayment(orderId: number, payment: number, token: string): Promise<PendingPaymentRecord> {
    const row = await this.httpClient.request<ApiPayment>({
      method: "POST",
      path: `pending-payments/order/${orderId}`,
      token,
      body: { Payment: payment },
    });
    return this.toPayment(row);
  }

  async updatePayment(paymentId: number, payment: number, token: string): Promise<PendingPaymentRecord> {
    const row = await this.httpClient.request<ApiPayment>({
      method: "PUT",
      path: `pending-payments/${paymentId}`,
      token,
      body: { Payment: payment },
    });
    return this.toPayment(row);
  }

  async deletePayment(paymentId: number, token: string): Promise<void> {
    await this.httpClient.request<void>({
      method: "DELETE",
      path: `pending-payments/${paymentId}`,
      token,
    });
  }

  private readonly toAccount = (row: ApiAccount): PendingAccount => ({
    orderId: numberValue(row.Order_Id),
    customerId: numberValue(row.Customer_Id),
    customerName: textValue(row.Customer_Name, "Cliente sin nombre"),
    date: textValue(row.Date),
    status: textValue(row.Status, "PENDIENTE"),
    currency: textValue(row.MoneyTipe, "MXN"),
    total: numberValue(row.Total),
    paid: numberValue(row.Paid),
    balance: numberValue(row.Balance),
  });

  private readonly toPayment = (row: ApiPayment): PendingPaymentRecord => ({
    id: numberValue(row.Id),
    customerId: numberValue(row.Customer_Id),
    orderId: numberValue(row.Order_Id),
    payment: numberValue(row.Payment),
    date: textValue(row.Date),
  });
}
