import { FacturationService } from "../services/FacturationService";
import {
  CreateInvoicePayload,
  FacturationInvoice,
  InvoiceCancelPayload,
  TaxIssuer,
  TaxIssuerPayload,
  TaxIssuerStatus,
} from "../model/Facturation";

export class FacturationManagementPage {
  constructor(private readonly service: FacturationService) {}

  getTaxIssuerByBusiness(businessId: number, token: string): Promise<TaxIssuer | null> {
    return this.service.getTaxIssuerByBusiness(businessId, token);
  }

  upsertTaxIssuer(payload: TaxIssuerPayload, token: string): Promise<TaxIssuer> {
    return this.service.upsertTaxIssuer(payload, token);
  }

  getTaxIssuerById(issuerId: string, token: string): Promise<TaxIssuer> {
    return this.service.getTaxIssuerById(issuerId, token);
  }

  uploadCsd(issuerId: string, payload: { certificateFile: File; privateKeyFile: File; privateKeyPassword: string }, token: string): Promise<TaxIssuer> {
    return this.service.uploadCsd(issuerId, payload, token);
  }

  activateTaxIssuer(issuerId: string, token: string): Promise<TaxIssuerStatus> {
    return this.service.activateTaxIssuer(issuerId, token);
  }

  validateReceiverRfc(rfc: string, token: string): Promise<{ valid: boolean; message: string }> {
    return this.service.validateReceiverRfc(rfc, token);
  }

  createInvoice(payload: CreateInvoicePayload, token: string): Promise<FacturationInvoice> {
    return this.service.createInvoice(payload, token);
  }

  getInvoiceById(invoiceId: string, token: string): Promise<FacturationInvoice> {
    return this.service.getInvoiceById(invoiceId, token);
  }

  downloadInvoiceFile(invoiceId: string, fileType: "pdf" | "xml", token: string): Promise<Blob> {
    return this.service.downloadInvoiceFile(invoiceId, fileType, token);
  }

  cancelInvoice(invoiceId: string, payload: InvoiceCancelPayload, token: string): Promise<void> {
    return this.service.cancelInvoice(invoiceId, payload, token);
  }

  sendInvoiceEmail(invoiceId: string, email: string, token: string): Promise<void> {
    return this.service.sendInvoiceEmail(invoiceId, email, token);
  }
}
