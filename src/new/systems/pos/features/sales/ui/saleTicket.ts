import { posMoneyFormatter } from "../../../shared/config/posCurrency";

export type CompletedSaleLine = {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};
export type CompletedSale = {
  folio: string;
  paymentMethodLabel: string;
  table: string;
  subtotal: number;
  discount: number;
  taxAmount: number;
  taxableBase: number;
  taxDescription?: string;
  total: number;
  customerName?: string;
  cashierName?: string;
  createdAt: string;
  items: CompletedSaleLine[];
};

export const formatSaleTicket = (sale: CompletedSale, storeName: string): string => {
  if (!sale.folio.trim() || !sale.items.length ||
      ![sale.subtotal, sale.discount, sale.taxAmount, sale.total].every(value => Number.isFinite(value) && value >= 0) ||
      sale.items.some(item => !Number.isFinite(item.quantity) || item.quantity <= 0 || !Number.isFinite(item.lineTotal) || item.lineTotal < 0)) {
    throw new Error("La venta no tiene datos válidos para compartir el ticket.");
  }
  const money = posMoneyFormatter.format;
  return [
    storeName.trim() || "Mi negocio",
    "Ticket de venta #" + sale.folio,
    "Fecha: " + new Date(sale.createdAt).toLocaleString("es-MX"),
    "Mesa: " + sale.table,
    "Método: " + sale.paymentMethodLabel,
    "Cliente: " + (sale.customerName || "General"),
    ...sale.items.map(item => item.quantity + " x " + item.name + " — " + money(item.lineTotal)),
    "Subtotal: " + money(sale.subtotal),
    sale.discount > 0 ? "Descuento: -" + money(sale.discount) : "",
    sale.taxAmount > 0 ? (sale.taxDescription || "Impuestos") + ": " + money(sale.taxAmount) : "",
    "Total: " + money(sale.total),
  ].filter(Boolean).join("\n");
};

export const shareSaleTicket = async (sale: CompletedSale, storeName: string): Promise<"shared" | "downloaded" | "cancelled"> => {
  const text = formatSaleTicket(sale, storeName);
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ title: "Ticket " + sale.folio, text });
      return "shared";
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return "cancelled";
      throw error;
    }
  }
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "ticket-" + sale.folio.replace(/[^a-zA-Z0-9_.-]/g, "-") + ".txt";
  document.body.appendChild(link);
  try {
    link.click();
  } finally {
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
  return "downloaded";
};
