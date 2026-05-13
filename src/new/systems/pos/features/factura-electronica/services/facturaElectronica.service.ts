import { FacturaElectronicaHttpClient } from "../api/FacturaElectronicaHttpClient";
import { getFacturaElectronicaApiBaseUrl } from "../config/facturaElectronicaEnv";
import {
  ApiMaybeExistingResponse,
  ApiResponse,
  BusinessAccount,
  BusinessAccountSyncRequest,
  CancelInvoicePayload,
  CancelInvoiceResult,
  CreateInvoiceRequestPayload,
  ExpeditionPlaceCreateRequest,
  FacturationStatusResponse,
  InvoiceCancellationDto,
  InvoiceFileDownload,
  InvoiceFileFormat,
  InvoiceSeriesCreateRequest,
  IssueInvoiceRequestPayload,
  IssuedInvoiceResponse,
  ListIssuedInvoicesFilters,
  ListIssuedInvoicesResponse,
  TaxIssuer,
  TaxIssuerCreateRequest,
  UploadCsdRequest,
} from "../model/facturaElectronica.types";

const client = new FacturaElectronicaHttpClient(getFacturaElectronicaApiBaseUrl());
const encode = (value: string | number): string => encodeURIComponent(String(value));
const buildQuery = (filters?: ListIssuedInvoicesFilters): Record<string, string | number | boolean | undefined> => {
  const query: Record<string, string | number | boolean | undefined> = {};

  Object.entries(filters ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query[key] = value;
  });

  return query;
};

export const facturaElectronicaService = {
  syncBusinessAccount(payload: BusinessAccountSyncRequest) {
    return client.request<ApiMaybeExistingResponse<BusinessAccount>>("/api/business-accounts/sync", {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    });
  },

  getBusinessAccountBySource(sourceSystem: string, externalBusinessId: string) {
    return client.request<ApiResponse<BusinessAccount>>(
      `/api/business-accounts/by-source/${encode(sourceSystem)}/${encode(externalBusinessId)}`,
    );
  },

  getFacturationStatus(businessAccountId: number) {
    return client.request<ApiResponse<FacturationStatusResponse>>(
      `/api/business-accounts/${encode(businessAccountId)}/facturation-status`,
    );
  },

  getTaxIssuersByBusinessAccount(businessAccountId: number) {
    return client.request<ApiResponse<TaxIssuer[]>>(`/api/tax-issuers/business/${encode(businessAccountId)}`);
  },

  createTaxIssuer(payload: TaxIssuerCreateRequest) {
    return client.request<ApiMaybeExistingResponse<TaxIssuer>>("/api/tax-issuers", {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    });
  },

  uploadTaxIssuerCsd(taxIssuerId: number, files: UploadCsdRequest) {
    const formData = new FormData();
    formData.append("certificate", files.certificate);
    formData.append("privateKey", files.privateKey);
    formData.append("privateKeyPassword", files.privateKeyPassword);

    return client.request<ApiResponse<unknown>>(`/api/tax-issuers/${encode(taxIssuerId)}/csd`, {
      method: "POST",
      body: formData,
    });
  },

  createExpeditionPlace(taxIssuerId: number, payload: ExpeditionPlaceCreateRequest) {
    return client.request<ApiMaybeExistingResponse<unknown>>(`/api/tax-issuers/${encode(taxIssuerId)}/expedition-places`, {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    });
  },

  createInvoiceSeries(taxIssuerId: number, payload: InvoiceSeriesCreateRequest) {
    return client.request<ApiMaybeExistingResponse<unknown>>(`/api/tax-issuers/${encode(taxIssuerId)}/series`, {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    });
  },

  createInvoiceRequest(payload: CreateInvoiceRequestPayload) {
    return client.request<ApiResponse<unknown>>("/api/invoice-requests", {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    });
  },

  issueInvoice(invoiceRequestId: number, payload: IssueInvoiceRequestPayload) {
    return client.request<ApiResponse<IssuedInvoiceResponse>>(`/api/invoice-requests/${encode(invoiceRequestId)}/issue`, {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    });
  },

  getInvoiceById(id: number) {
    return client.request<ApiResponse<unknown>>(`/api/invoices/${encode(id)}`);
  },

  listInvoicesByBusinessAccount(businessAccountId: number, filters?: ListIssuedInvoicesFilters) {
    return client.request<ApiResponse<ListIssuedInvoicesResponse>>(
      `/api/business-accounts/${encode(businessAccountId)}/invoices`,
      { query: buildQuery(filters) },
    );
  },

  cancelInvoice(invoiceId: number, payload: CancelInvoicePayload) {
    console.log("Canceling invoice with payload:", payload);
    return client.request<ApiResponse<CancelInvoiceResult>>(`/api/invoices/${encode(invoiceId)}/cancel`, {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    });
  },

  getInvoiceCancellations(invoiceId: number) {
    return client.request<ApiResponse<InvoiceCancellationDto[]>>(`/api/invoices/${encode(invoiceId)}/cancellations`);
  },

  getInvoiceBySource(sourceSystem: string, documentType: string, externalDocumentId: string) {
    return client.request<ApiResponse<unknown>>(
      `/api/invoices/by-source/${encode(sourceSystem)}/${encode(documentType)}/${encode(externalDocumentId)}`,
    );
  },

  downloadInvoiceFile(invoiceId: number, format: InvoiceFileFormat): Promise<InvoiceFileDownload> {
    return client.download(`/api/invoices/${encode(invoiceId)}/files/${format}`, `factura-${invoiceId}.${format}`);
  },
};
