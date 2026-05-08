export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiMaybeExistingResponse<T> extends ApiResponse<T> {
  wasExisting?: boolean;
}

export type BillingSetupState = {
  businessAccountId?: number;
  taxIssuerId?: number;
  issuerRfc?: string;
  issuerName?: string;
  fiscalRegime?: string;
  taxZipCode?: string;
  expeditionPlace?: string;
  serie?: string;
  readyToInvoice: boolean;
  missingSteps: string[];
};

export type InvoiceFlowState = {
  invoiceRequestId?: number;
  issuedInvoiceId?: number;
  facturamaId?: string;
  uuid?: string;
  serie?: string;
  folio?: string;
  status?: string;
};

export type BusinessDraft = {
  externalBusinessId: string;
  businessName: string;
  tradeName: string;
  contactEmail: string;
  contactPhone: string;
  defaultCurrency: string;
};

export interface BusinessAccountSyncRequest extends BusinessDraft {
  sourceSystem: string;
}

export type BusinessAccountDraft = BusinessDraft & {
  sourceSystem: string;
};

export type IssuerFiscalDraft = {
  rfc: string;
  legalName: string;
  tradeName: string;
  fiscalRegime: string;
  taxZipCode: string;
  email: string;
  phone: string;
};

export type ReceiverDraft = {
  rfc: string;
  name: string;
  fiscalRegime: string;
  taxZipCode: string;
  cfdiUse: string;
};

export type InvoiceReceiverDraft = ReceiverDraft;

export type InvoiceDraft = {
  externalDocumentId: string;
  externalUserId?: string;
  paymentForm: string;
  paymentMethod: string;
  currency: string;
  expeditionPlace: string;
  exportation: string;
  serie: string;
};

export type InvoiceConceptDraft = {
  description: string;
  productServiceCode: string;
  unitCode: string;
  unitName: string;
  quantity: number;
  unitPrice: number;
  taxObject: string;
  iva16: boolean;
};

export type InvoiceConceptLine = InvoiceConceptDraft & {
  id: string;
  externalItemId: string;
  sku: string;
  source: "manual" | "pos";
  sourceLabel: string;
};

export interface BuildInvoiceRequestPayloadInput {
  businessPayload: BusinessAccountSyncRequest;
  selectedIssuer: TaxIssuer;
  receiverDraft: ReceiverDraft;
  invoiceDraft: InvoiceDraft;
  conceptLines: InvoiceConceptLine[];
}

export interface BusinessAccount {
  id?: number;
  businessAccountId?: number;
  sourceSystem?: string;
  externalBusinessId?: string;
  businessName?: string;
  tradeName?: string;
  contactEmail?: string;
  contactPhone?: string;
  defaultCurrency?: string;
}

export interface FacturationStatusResponse {
  businessAccountId?: number;
  taxIssuerId?: number;
  issuerRfc?: string;
  issuerName?: string;
  fiscalRegime?: string;
  taxZipCode?: string;
  expeditionPlace?: string;
  serie?: string;
  readyToInvoice?: boolean;
  missingSteps?: string[];
}

export interface TaxIssuer {
  id?: number;
  taxIssuerId?: number;
  businessAccountId?: number;
  rfc?: string;
  legalName?: string;
  name?: string;
  tradeName?: string;
  fiscalRegime?: string;
  taxZipCode?: string;
  email?: string;
  phone?: string;
  status?: string;
  isDefault?: boolean;
}

export interface TaxIssuerCreateRequest {
  businessAccountId: number;
  rfc: string;
  legalName: string;
  tradeName: string;
  fiscalRegime: string;
  taxZipCode: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  isDefault: boolean;
}

export interface UploadCsdRequest {
  certificate: File;
  privateKey: File;
  privateKeyPassword: string;
}

export interface ExpeditionPlaceCreateRequest {
  zipCode: string;
  description: string;
  isDefault: boolean;
  status: "active" | "inactive";
}

export interface InvoiceSeriesCreateRequest {
  serie: string;
  nextFolio: number;
  status: "active" | "inactive";
}

export interface CreateInvoiceRequestPayload {
  sourceSystem: string;
  sourceDocumentType: string;
  externalDocumentId: string;
  externalUserId?: string;
  business: BusinessAccountSyncRequest;
  issuer: {
    rfc: string;
  };
  receiver: {
    rfc: string;
    name: string;
    fiscalRegime: string;
    taxZipCode: string;
    cfdiUse: string;
  };
  cfdi: {
    type: string;
    paymentForm: string;
    paymentMethod: string;
    currency: string;
    exchangeRate: number | null;
    expeditionPlace: string;
    exportation: string;
    globalInformation?: {
      periodicity: string;
      months: string;
      year: string;
    };
  };
  totals: {
    subtotal: number;
    discount: number;
    taxesTotal: number;
    total: number;
  };
  concepts: Array<{
    externalItemId: string;
    productServiceCode: string;
    sku: string;
    description: string;
    unitCode: string;
    unitName: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    subtotal: number;
    taxObject: string;
    total: number;
    taxes: Array<{
      taxCode: string;
      taxName: string;
      factorType: string;
      rate: number;
      base: number;
      amount: number;
      isRetention: boolean;
    }>;
    metadata?: Record<string, unknown>;
  }>;
}

export interface IssueInvoiceRequestPayload {
  serie: string;
  downloadFiles: boolean;
}

export interface IssuedInvoiceResponse {
  invoiceRequestId: number;
  issuedInvoiceId: number;
  facturamaId?: string;
  uuid?: string;
  serie?: string;
  folio?: string;
  status?: string;
}

export type InvoiceFileFormat = "pdf" | "xml" | "html";

export interface InvoiceFileDownload {
  blob: Blob;
  filename: string;
  contentType: string;
}
