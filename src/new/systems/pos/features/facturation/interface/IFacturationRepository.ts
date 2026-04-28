import {
  CreateInvoicePayload,
  FacturationInvoice,
  InvoiceCancelPayload,
  TaxIssuer,
  TaxIssuerPayload,
  TaxIssuerStatus,
} from "../model/Facturation";

export interface IFacturationRepository {
  upsertTaxIssuer(payload: TaxIssuerPayload, token: string): Promise<TaxIssuer>;
  getTaxIssuerByBusiness(businessId: number, token: string): Promise<TaxIssuer | null>;
  getTaxIssuerById(issuerId: string, token: string): Promise<TaxIssuer>;
  uploadCsd(
    issuerId: string,
    payload: { certificateFile: File; privateKeyFile: File; privateKeyPassword: string },
    token: string,
  ): Promise<TaxIssuer>;
  activateTaxIssuer(issuerId: string, token: string): Promise<TaxIssuerStatus>;
  validateReceiverRfc(rfc: string, token: string): Promise<{ valid: boolean; message: string }>;
  createInvoice(payload: CreateInvoicePayload, token: string): Promise<FacturationInvoice>;
  getInvoiceById(invoiceId: string, token: string): Promise<FacturationInvoice>;
  downloadInvoiceFile(invoiceId: string, fileType: "pdf" | "xml", token: string): Promise<Blob>;
  cancelInvoice(invoiceId: string, payload: InvoiceCancelPayload, token: string): Promise<void>;
  sendInvoiceEmail(invoiceId: string, email: string, token: string): Promise<void>;
}
