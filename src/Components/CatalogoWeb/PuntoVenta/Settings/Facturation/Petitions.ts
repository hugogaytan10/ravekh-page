import { URL } from "../../Const/Const";

export interface InvoiceReceiver {
  rfc: string;
  name: string;
  email: string;
  fiscalRegime: string;
  cfdiUse: string;
  taxZipCode: string;
}

export interface InvoicePayload {
  orderId: number;
  emitterRfc: string;
  expeditionPlace: string;
  paymentForm: string;
  paymentMethod: string;
  receiver: InvoiceReceiver;
}

export const createInvoice = async (payload: InvoicePayload, token: string) => {
  const response = await fetch(`${URL}facturation/invoices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const errorMessage = data?.message || "No fue posible crear la factura.";
    throw new Error(errorMessage);
  }

  return data;
};

export const getInvoiceById = async (invoiceId: string, token: string) => {
  const response = await fetch(`${URL}facturation/invoices/${invoiceId}`, {
    method: "GET",
    headers: { token },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const errorMessage = data?.message || "No encontramos la factura solicitada.";
    throw new Error(errorMessage);
  }

  return data;
};

export const getInvoicePdf = async (invoiceId: string, token: string) => {
  const response = await fetch(`${URL}facturation/invoices/${invoiceId}/files/pdf`, {
    method: "GET",
    headers: { token },
  });

  if (!response.ok) {
    let errorMessage = "No fue posible descargar el PDF de la factura.";
    try {
      const data = await response.json();
      if (data?.message) {
        errorMessage = data.message;
      }
    } catch {
      // Si no viene JSON mantenemos mensaje por defecto.
    }
    throw new Error(errorMessage);
  }

  return response.blob();
};
