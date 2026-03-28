export interface StripeConfigSnapshot {
  publishableKey?: string;
  currency?: string;
  enabled?: boolean;
  accountId?: string | null;
  [key: string]: unknown;
}

export interface CreateConnectedAccountInput {
  businessId: number;
}

export interface ConnectedAccountSnapshot {
  connectedAccountId: string;
  [key: string]: unknown;
}

export interface CreateAccountLinkInput {
  connectedAccountId: string;
  businessId: number;
  refreshUrl?: string;
  returnUrl?: string;
  type?: "account_onboarding" | "account_update";
}

export interface AccountLinkSnapshot {
  url: string;
  expiresAt?: number;
  [key: string]: unknown;
}

export interface UpdateConnectedAccountInput {
  connectedAccountId: string;
  [key: string]: unknown;
}

export interface CreatePaymentIntentInput {
  amount: number;
  connectedAccountId: string;
  businessId: number;
  [key: string]: unknown;
}

export interface PaymentIntentSnapshot {
  paymentIntentId?: string;
  clientSecret?: string;
  status?: string;
  [key: string]: unknown;
}
