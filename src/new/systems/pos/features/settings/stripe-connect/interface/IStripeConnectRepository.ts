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

export interface IStripeConnectRepository {
  getConfig(token?: string): Promise<StripeConfigSnapshot>;
  createConnectedAccount(input: CreateConnectedAccountInput, token?: string): Promise<ConnectedAccountSnapshot>;
  createAccountLink(input: CreateAccountLinkInput, token?: string): Promise<AccountLinkSnapshot>;
  updateConnectedAccount(input: UpdateConnectedAccountInput, token?: string): Promise<void>;
  createPaymentIntent(input: CreatePaymentIntentInput, token?: string): Promise<PaymentIntentSnapshot>;
}
