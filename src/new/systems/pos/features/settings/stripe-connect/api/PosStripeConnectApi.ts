import { HttpClient } from "../../../../../core/api/HttpClient";
import { IStripeConnectRepository } from "../interface/IStripeConnectRepository";
import {
  AccountLinkSnapshot,
  ConnectedAccountSnapshot,
  CreateAccountLinkInput,
  CreateConnectedAccountInput,
  CreatePaymentIntentInput,
  PaymentIntentSnapshot,
  StripeConfigSnapshot,
  UpdateConnectedAccountInput,
} from "../model/StripeConnect";

type StripeConnectApiResponse = {
  connectedAccountId?: string;
  accountId?: string;
  url?: string;
  expiresAt?: number;
  paymentIntentId?: string;
  clientSecret?: string;
  status?: string;
  [key: string]: unknown;
};

export class PosStripeConnectApi implements IStripeConnectRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getConfig(token?: string): Promise<StripeConfigSnapshot> {
    const response = await this.httpClient.request<StripeConfigSnapshot>({
      method: "GET",
      path: "configStripe",
      token,
    });

    return response ?? {};
  }

  async createConnectedAccount(input: CreateConnectedAccountInput, token?: string): Promise<ConnectedAccountSnapshot> {
    const response = await this.httpClient.request<StripeConnectApiResponse>({
      method: "POST",
      path: "createConnectedAccount",
      token,
      body: {
        businessId: input.businessId,
      },
    });

    return {
      ...response,
      connectedAccountId: String(response.connectedAccountId ?? response.accountId ?? ""),
    };
  }

  async createAccountLink(input: CreateAccountLinkInput, token?: string): Promise<AccountLinkSnapshot> {
    const response = await this.httpClient.request<StripeConnectApiResponse>({
      method: "POST",
      path: "createAccountLink",
      token,
      body: {
        connectedAccountId: input.connectedAccountId,
        businessId: input.businessId,
        refresh_url: input.refreshUrl,
        return_url: input.returnUrl,
        type: input.type,
      },
    });

    return {
      ...response,
      url: String(response.url ?? ""),
      expiresAt: typeof response.expiresAt === "number" ? response.expiresAt : undefined,
    };
  }

  async updateConnectedAccount(input: UpdateConnectedAccountInput, token?: string): Promise<void> {
    await this.httpClient.request<void>({
      method: "POST",
      path: "updateConnectedAccount",
      token,
      body: input,
    });
  }

  async createPaymentIntent(input: CreatePaymentIntentInput, token?: string): Promise<PaymentIntentSnapshot> {
    const response = await this.httpClient.request<StripeConnectApiResponse>({
      method: "POST",
      path: "createPaymentIntent",
      token,
      body: {
        amount: input.amount,
        connectedAccountId: input.connectedAccountId,
        businessId: input.businessId,
      },
    });

    return {
      ...response,
      paymentIntentId: response.paymentIntentId ? String(response.paymentIntentId) : undefined,
      clientSecret: response.clientSecret ? String(response.clientSecret) : undefined,
      status: response.status ? String(response.status) : undefined,
    };
  }
}
