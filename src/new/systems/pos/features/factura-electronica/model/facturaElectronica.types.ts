export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface BusinessAccountSyncRequest {
  sourceSystem: string;
  externalBusinessId: string;
  businessName: string;
  tradeName: string;
  contactEmail: string;
  contactPhone: string;
  defaultCurrency: string;
}


export interface BusinessAccountDraft {
  sourceSystem: string;
  externalBusinessId: string;
  businessName: string;
  tradeName: string;
  contactEmail: string;
  contactPhone: string;
  defaultCurrency: string;
}

export interface IssuerFiscalDraft {
  rfc: string;
  legalName: string;
  tradeName: string;
  fiscalRegime: string;
  taxZipCode: string;
  email: string;
  phone: string;
}

export interface InvoiceReceiverDraft {
  rfc: string;
  name: string;
  fiscalRegime: string;
  taxZipCode: string;
  cfdiUse: string;
}

export interface BuildInvoiceRequestPayloadInput {
  businessPayload: BusinessAccountSyncRequest;
  issuerRfc: string;
  issuerTaxZipCode: string;
  receiverDraft: InvoiceReceiverDraft;
  externalDocumentId: string;
  externalUserId: string;
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
  externalUserId: string;
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
  facturamaId: string;
  uuid: string;
  serie: string;
  folio: string;
  status: string;
}

export type InvoiceFileFormat = "pdf" | "xml" | "html";

export interface InvoiceFileDownload {
  blob: Blob;
  filename: string;
  contentType: string;
}
