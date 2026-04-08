import { StripeConnectService } from "../services/StripeConnectService";
import {
  AccountLinkSnapshot,
  ConnectedAccountSnapshot,
  CreateAccountLinkInput,
  PaymentIntentSnapshot,
  StripeConfigSnapshot,
} from "../model/StripeConnect";

export class StripeConnectManagementPage {
  constructor(private readonly service: StripeConnectService) {}

  async getConfig(token?: string): Promise<StripeConfigSnapshot> {
    return this.service.getConfig(token);
  }

  async ensureConnectedAccount(businessId: number, token?: string): Promise<ConnectedAccountSnapshot> {
    if (!Number.isFinite(businessId) || businessId <= 0) {
      throw new Error("Invalid businessId to create connected account.");
    }

    return this.service.createConnectedAccount(businessId, token);
  }

  async buildOnboardingLink(input: CreateAccountLinkInput, token?: string): Promise<AccountLinkSnapshot> {
    if (!input.connectedAccountId?.trim()) {
      throw new Error("connectedAccountId is required to create account link.");
    }

    if (!Number.isFinite(input.businessId) || input.businessId <= 0) {
      throw new Error("businessId is required to create account link.");
    }

    return this.service.createAccountLink(input, token);
  }

  async updateConnectedAccount(connectedAccountId: string, token?: string): Promise<void> {
    if (!connectedAccountId?.trim()) {
      throw new Error("connectedAccountId is required to update account.");
    }

    await this.service.updateConnectedAccount(connectedAccountId, token);
  }

  async createPaymentIntent(
    amount: number,
    connectedAccountId: string,
    businessId: number,
    token?: string,
  ): Promise<PaymentIntentSnapshot> {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("amount must be a positive number.");
    }

    if (!connectedAccountId?.trim()) {
      throw new Error("connectedAccountId is required to create a PaymentIntent.");
    }

    if (!Number.isFinite(businessId) || businessId <= 0) {
      throw new Error("businessId is required to create a PaymentIntent.");
    }

    return this.service.createPaymentIntent(amount, connectedAccountId, businessId, token);
  }
}
