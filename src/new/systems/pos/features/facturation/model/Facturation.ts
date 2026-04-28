export type TaxIssuerStatus = "draft" | "pending_csd" | "validating" | "active" | "inactive" | "rejected" | "expired";

export type TaxIssuerPayload = {
  businessId: number;
  rfc: string;
  legalName: string;
  fiscalRegime: string;
  fiscalZipCode: string;
  email: string;
  phone: string;
  status?: TaxIssuerStatus;
};

export type TaxIssuer = TaxIssuerPayload & {
  id: string;
  status: TaxIssuerStatus;
};

export type ReceiverPayload = {
  rfc: string;
  name: string;
  email: string;
  fiscalRegime: string;
  cfdiUse: string;
  taxZipCode: string;
};

export type CreateInvoicePayload = {
  orderId: string;
  paymentForm: string;
  paymentMethod: string;
  currency: string;
  exportation: string;
  receiver: ReceiverPayload;
};

export type FacturationInvoice = {
  id: string;
  folio?: string;
  uuid?: string;
  facturamaId?: string;
  status?: string;
  receiver?: Partial<ReceiverPayload>;
  issuer?: Partial<TaxIssuerPayload>;
  createdAt?: string;
};

export type InvoiceCancelPayload = {
  motive: string;
  uuidReplacement?: string;
};
