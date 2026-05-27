import { IStripeConnectRepository } from "../interface/IStripeConnectRepository";
import {
  AccountLinkSnapshot,
  ConnectedAccountSnapshot,
  CreateAccountLinkInput,
  PaymentIntentSnapshot,
  StripeConfigSnapshot,
} from "../model/StripeConnect";

export class StripeConnectService {
  constructor(private readonly repository: IStripeConnectRepository) {}

  getConfig(token?: string): Promise<StripeConfigSnapshot> {
    return this.repository.getConfig(token);
  }

  async createConnectedAccount(businessId: number, token?: string): Promise<ConnectedAccountSnapshot> {
    return this.repository.createConnectedAccount({ businessId }, token);
  }

  async createAccountLink(input: CreateAccountLinkInput, token?: string): Promise<AccountLinkSnapshot> {
    return this.repository.createAccountLink(input, token);
  }

  async updateConnectedAccount(connectedAccountId: string, token?: string): Promise<void> {
    await this.repository.updateConnectedAccount({ connectedAccountId }, token);
  }

  async createPaymentIntent(
    amount: number,
    connectedAccountId: string,
    businessId: number,
    token?: string,
  ): Promise<PaymentIntentSnapshot> {
    return this.repository.createPaymentIntent({ amount, connectedAccountId, businessId }, token);
  }
}
