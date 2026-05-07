import { FacturaElectronicaHttpClient } from "../api/FacturaElectronicaHttpClient";
import { getFacturaElectronicaApiBaseUrl } from "../config/facturaElectronicaEnv";
import {
  ApiResponse,
  BusinessAccountSyncRequest,
  CreateInvoiceRequestPayload,
  ExpeditionPlaceCreateRequest,
  InvoiceFileDownload,
  InvoiceFileFormat,
  InvoiceSeriesCreateRequest,
  IssueInvoiceRequestPayload,
  IssuedInvoiceResponse,
  TaxIssuerCreateRequest,
  UploadCsdRequest,
} from "../model/facturaElectronica.types";

const client = new FacturaElectronicaHttpClient(getFacturaElectronicaApiBaseUrl());
const encode = (value: string | number): string => encodeURIComponent(String(value));

export const facturaElectronicaService = {
  syncBusinessAccount(payload: BusinessAccountSyncRequest) {
    return client.request<ApiResponse<unknown>>("/api/business-accounts/sync", {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    });
  },

  createTaxIssuer(payload: TaxIssuerCreateRequest) {
    return client.request<ApiResponse<unknown>>("/api/tax-issuers", {
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
    return client.request<ApiResponse<unknown>>(`/api/tax-issuers/${encode(taxIssuerId)}/expedition-places`, {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    });
  },

  createInvoiceSeries(taxIssuerId: number, payload: InvoiceSeriesCreateRequest) {
    return client.request<ApiResponse<unknown>>(`/api/tax-issuers/${encode(taxIssuerId)}/series`, {
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

  getInvoiceBySource(sourceSystem: string, documentType: string, externalDocumentId: string) {
    return client.request<ApiResponse<unknown>>(
      `/api/invoices/by-source/${encode(sourceSystem)}/${encode(documentType)}/${encode(externalDocumentId)}`,
    );
  },

  downloadInvoiceFile(invoiceId: number, format: InvoiceFileFormat): Promise<InvoiceFileDownload> {
    return client.download(`/api/invoices/${encode(invoiceId)}/files/${format}`, `factura-${invoiceId}.${format}`);
  },
};
