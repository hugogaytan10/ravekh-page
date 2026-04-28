import { HttpClient } from "../../../../core/api/HttpClient";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { IFacturationRepository } from "../interface/IFacturationRepository";
import {
  CreateInvoicePayload,
  FacturationInvoice,
  InvoiceCancelPayload,
  TaxIssuer,
  TaxIssuerPayload,
  TaxIssuerStatus,
} from "../model/Facturation";

type TaxIssuerApi = {
  id?: string | number;
  _id?: string | number;
  issuerId?: string | number;
  businessId?: number;
  rfc?: string;
  legalName?: string;
  fiscalRegime?: string;
  fiscalZipCode?: string;
  email?: string;
  phone?: string;
  status?: TaxIssuerStatus;
  message?: string | null;
};

type InvoiceApi = {
  id?: string | number;
  _id?: string | number;
  invoiceId?: string | number;
  folio?: string;
  uuid?: string;
  facturamaId?: string;
  status?: string;
  receiver?: Record<string, unknown>;
  issuer?: Record<string, unknown>;
  createdAt?: string;
  created_at?: string;
  createDate?: string;
};

const parseApiError = (responsePayload: unknown, fallback: string): Error => {
  const payload = responsePayload as { message?: string; error?: string; errors?: unknown } | null;
  const message = payload?.message ?? payload?.error;
  return new Error(message || fallback);
};

export class PosFacturationApi implements IFacturationRepository {
  private readonly baseUrl = getPosApiBaseUrl();

  constructor(private readonly httpClient: HttpClient) {}

  async upsertTaxIssuer(payload: TaxIssuerPayload, token: string): Promise<TaxIssuer> {
    const response = await this.httpClient.request<TaxIssuerApi>({
      method: "POST",
      path: "tax-issuers",
      token,
      body: payload,
    });

    return this.toTaxIssuer(response, payload.businessId);
  }

  async getTaxIssuerByBusiness(businessId: number, token: string): Promise<TaxIssuer | null> {
    const response = await this.httpClient.request<TaxIssuerApi | null>({
      method: "GET",
      path: `tax-issuers/business/${businessId}`,
      token,
    });

    if (!response) return null;
    const issuerMissingMessage = response.message === null || response.message === "Este negocio todavía no tiene emisor fiscal configurado.";
    const hasIssuerIdentity = Boolean(response.id ?? response._id ?? response.issuerId);
    if (issuerMissingMessage || !hasIssuerIdentity) return null;

    return this.toTaxIssuer(response, businessId);
  }

  async getTaxIssuerById(issuerId: string, token: string): Promise<TaxIssuer> {
    const response = await this.httpClient.request<TaxIssuerApi>({
      method: "GET",
      path: `tax-issuers/${issuerId}`,
      token,
    });

    return this.toTaxIssuer(response);
  }

  async uploadCsd(
    issuerId: string,
    payload: { certificateFile: File; privateKeyFile: File; privateKeyPassword: string },
    token: string,
  ): Promise<TaxIssuer> {
    const formData = new FormData();
    formData.append("certificateFile", payload.certificateFile);
    formData.append("privateKeyFile", payload.privateKeyFile);
    formData.append("privateKeyPassword", payload.privateKeyPassword);

    const response = await this.httpClient.request<TaxIssuerApi>({
      method: "POST",
      path: `tax-issuers/${issuerId}/csd`,
      token,
      body: formData,
    });

    return this.toTaxIssuer(response);
  }

  async activateTaxIssuer(issuerId: string, token: string): Promise<TaxIssuerStatus> {
    const response = await this.httpClient.request<{ status?: TaxIssuerStatus } | TaxIssuerApi>({
      method: "POST",
      path: `tax-issuers/${issuerId}/activate`,
      token,
      body: {},
    });

    return (response as { status?: TaxIssuerStatus }).status ?? "validating";
  }

  async validateReceiverRfc(rfc: string, token: string): Promise<{ valid: boolean; message: string }> {
    const response = await this.httpClient.request<{ valid?: boolean; message?: string; isValid?: boolean }>({
      method: "POST",
      path: "facturation/validate-rfc",
      token,
      body: { rfc },
    });

    return {
      valid: Boolean(response.valid ?? response.isValid),
      message: response.message ?? "Validación completada.",
    };
  }

  async createInvoice(payload: CreateInvoicePayload, token: string): Promise<FacturationInvoice> {
    const response = await this.httpClient.request<InvoiceApi>({
      method: "POST",
      path: "facturation/invoices",
      token,
      body: payload,
    });

    return this.toInvoice(response);
  }

  async getInvoiceById(invoiceId: string, token: string): Promise<FacturationInvoice> {
    const response = await this.httpClient.request<InvoiceApi>({
      method: "GET",
      path: `facturation/invoices/${invoiceId}`,
      token,
    });

    return this.toInvoice(response);
  }

  async downloadInvoiceFile(invoiceId: string, fileType: "pdf" | "xml", token: string): Promise<Blob> {
    const response = await fetch(new URL(`facturation/invoices/${invoiceId}/files/${fileType}`, this.baseUrl).toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        token,
      },
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw parseApiError(payload, `No fue posible descargar el archivo ${fileType.toUpperCase()}.`);
    }

    return response.blob();
  }

  async cancelInvoice(invoiceId: string, payload: InvoiceCancelPayload, token: string): Promise<void> {
    await this.httpClient.request<void>({
      method: "DELETE",
      path: `facturation/invoices/${invoiceId}`,
      token,
      body: payload,
    });
  }

  async sendInvoiceEmail(invoiceId: string, email: string, token: string): Promise<void> {
    await this.httpClient.request<void>({
      method: "POST",
      path: `facturation/invoices/${invoiceId}/send-email`,
      token,
      body: { email },
    });
  }

  private toTaxIssuer(response: TaxIssuerApi, fallbackBusinessId = 0): TaxIssuer {
    return {
      id: String(response.id ?? response._id ?? response.issuerId ?? ""),
      businessId: Number(response.businessId ?? fallbackBusinessId ?? 0),
      rfc: response.rfc ?? "",
      legalName: response.legalName ?? "",
      fiscalRegime: response.fiscalRegime ?? "",
      fiscalZipCode: response.fiscalZipCode ?? "",
      email: response.email ?? "",
      phone: response.phone ?? "",
      status: response.status ?? "draft",
    };
  }

  private toInvoice(response: InvoiceApi): FacturationInvoice {
    return {
      id: String(response.id ?? response._id ?? response.invoiceId ?? ""),
      folio: response.folio,
      uuid: response.uuid,
      facturamaId: response.facturamaId,
      status: response.status,
      receiver: (response.receiver ?? {}) as FacturationInvoice["receiver"],
      issuer: (response.issuer ?? {}) as FacturationInvoice["issuer"],
      createdAt: response.createdAt ?? response.created_at ?? response.createDate,
    };
  }
}
