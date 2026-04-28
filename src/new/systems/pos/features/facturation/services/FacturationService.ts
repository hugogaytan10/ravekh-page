import { IFacturationRepository } from "../interface/IFacturationRepository";
import {
  CreateInvoicePayload,
  FacturationInvoice,
  InvoiceCancelPayload,
  TaxIssuer,
  TaxIssuerPayload,
  TaxIssuerStatus,
} from "../model/Facturation";

export class FacturationService {
  constructor(private readonly repository: IFacturationRepository) {}

  async upsertTaxIssuer(payload: TaxIssuerPayload, token: string): Promise<TaxIssuer> {
    return this.repository.upsertTaxIssuer(payload, token);
  }

  async getTaxIssuerByBusiness(businessId: number, token: string): Promise<TaxIssuer | null> {
    return this.repository.getTaxIssuerByBusiness(businessId, token);
  }

  async getTaxIssuerById(issuerId: string, token: string): Promise<TaxIssuer> {
    return this.repository.getTaxIssuerById(issuerId, token);
  }

  async uploadCsd(
    issuerId: string,
    payload: { certificateFile: File; privateKeyFile: File; privateKeyPassword: string },
    token: string,
  ): Promise<TaxIssuer> {
    return this.repository.uploadCsd(issuerId, payload, token);
  }

  async activateTaxIssuer(issuerId: string, token: string): Promise<TaxIssuerStatus> {
    return this.repository.activateTaxIssuer(issuerId, token);
  }

  async validateReceiverRfc(rfc: string, token: string): Promise<{ valid: boolean; message: string }> {
    return this.repository.validateReceiverRfc(rfc, token);
  }

  async createInvoice(payload: CreateInvoicePayload, token: string): Promise<FacturationInvoice> {
    return this.repository.createInvoice(payload, token);
  }

  async getInvoiceById(invoiceId: string, token: string): Promise<FacturationInvoice> {
    return this.repository.getInvoiceById(invoiceId, token);
  }

  async downloadInvoiceFile(invoiceId: string, fileType: "pdf" | "xml", token: string): Promise<Blob> {
    return this.repository.downloadInvoiceFile(invoiceId, fileType, token);
  }

  async cancelInvoice(invoiceId: string, payload: InvoiceCancelPayload, token: string): Promise<void> {
    await this.repository.cancelInvoice(invoiceId, payload, token);
  }

  async sendInvoiceEmail(invoiceId: string, email: string, token: string): Promise<void> {
    await this.repository.sendInvoiceEmail(invoiceId, email, token);
  }
}
