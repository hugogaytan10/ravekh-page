import { resolvePosCurrency } from "../../../shared/config/posCurrency";
import type { HttpClient } from "../../../../../core/api/HttpClient";
import type { SalesTicket } from "../model/SalesReport";
import { escapeTicketHtml as escape, ticketContactHtml, ticketFooterHtml, type TicketCustomization } from "../../../shared/config/posTicket";

type RecordRow = Record<string, unknown>;
export type ReportTicket = SalesTicket & { subtotal: number; amountReceived: number | null; note: string };
export async function loadReportTicket(http: HttpClient, sale: SalesTicket, token: string): Promise<ReportTicket> {
  const command = sale.type === "COMMAND";
  const [operation, products] = await Promise.all([
    http.request<RecordRow>({ method: "GET", path: `${command ? "commands" : "orders"}/${sale.id}`, token, branchId: sale.branchId }),
    http.request<RecordRow[]>({ method: "GET", path: `products/${command ? "command" : "order"}/${sale.id}`, token, branchId: sale.branchId }),
  ]);
  if (!operation || Number(operation.Id) !== sale.id || !Array.isArray(products) || products.length === 0) throw new Error("No se encontró el detalle de esta venta. No se imprimió un ticket incompleto.");
  const subtotal = Number(operation.Total);
  const discounted = Number(operation.Discount) ? Number(operation.TotalDiscount) : subtotal;
  const total = Number(operation.Tax) ? Number(operation.TotalTaxes) : discounted;
  const amountReceived = operation.AmountReceived == null ? null : Number(operation.AmountReceived);
  if (![subtotal, discounted, total].every(value => Number.isFinite(value) && value >= 0) || (amountReceived !== null && !Number.isFinite(amountReceived))) throw new Error("La venta contiene importes inválidos. No se pudo reimprimir.");
  const lines = products.map((product, index) => {
    const quantity = Number(product.Item_Quantity);
    const unitPrice = Number(product.Item_Price);
    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) throw new Error("La venta contiene un producto con importes inválidos.");
    return { detailId: index, itemName: [product.Item_Name, product.Color_Name, product.Size_Name].filter(Boolean).join(" · "), quantity, unitPrice, detailAmount: Math.round(quantity * unitPrice * 100) / 100, notes: command && product.Item_Notes ? String(product.Item_Notes) : null };
  });
  return { ...sale, date: String(operation.Date ?? sale.date), paymentMethod: String(operation.PaymentMethod || "PENDIENTE"), currency: String(operation.MoneyTipe || sale.currency), employeeName: String(products[0].Employee_Name || sale.employeeName || "Sin empleado"), customerName: String(products[0].Customer_Name || sale.customerName || "Público general"), subtotal, total, discountApplied: Math.round((subtotal-discounted)*100)/100, taxesApplied: Math.round((total-discounted)*100)/100, amountReceived, note: String(operation.Note ?? ""), products: lines };
}

export function renderReportTicket(sale: ReportTicket, business: RecordRow, settings: TicketCustomization, paper: "58" | "80"): string {
  const money = new Intl.NumberFormat("es-MX", { style: "currency", currency: resolvePosCurrency(sale.currency).iso });
  const date = new Date(sale.date);
  const dateLabel = Number.isNaN(date.getTime()) ? sale.date : date.toLocaleString("es-MX");
  const logo = String(business.Logo ?? "");
  const rows = sale.products.map(product => `<tr><td>${escape(product.quantity)} x ${escape(product.itemName)}<small>${escape(money.format(product.unitPrice))} c/u</small>${product.notes ? `<small>Nota: ${escape(product.notes)}</small>` : ""}</td><td>${escape(money.format(product.detailAmount))}</td></tr>`).join("");
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Ticket ${escape(sale.id)}</title><style>
    @page{size:${paper}mm auto;margin:2mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#111;margin:0}.actions{padding:12px;text-align:center}.ticket{width:${paper}mm;max-width:100%;margin:auto;padding:3mm}h1{font-size:18px;text-align:center}p{font-size:12px;margin:5px 0;white-space:pre-wrap;overflow-wrap:anywhere}.logo{display:block;max-width:70%;max-height:22mm;margin:auto}table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:12px}td{padding:5px 0;border-bottom:1px dashed #aaa;overflow-wrap:anywhere;vertical-align:top}td:last-child{width:30%;text-align:right}small{display:block;margin-top:3px}.total{font-size:16px;text-align:right}@media print{.actions{display:none}.ticket{margin:0;width:100%}}
    </style></head><body><div class="actions"><button onclick="window.print()">Imprimir ticket</button></div><main class="ticket">
    ${settings.showLogo && /^https?:\/\//i.test(logo) ? `<img class="logo" src="${escape(logo)}" alt="Logo del negocio">` : ""}
    <h1>${escape(business.Name || "Mi negocio")}</h1>${ticketContactHtml(settings, String(business.PhoneNumber ?? ""), String(business.Address ?? ""))}
    <p>Ticket de venta #${escape(sale.id)} · ${sale.type === "COMMAND" ? "Comanda" : "Venta POS"}</p><p>Fecha: ${escape(dateLabel)}</p>
    ${settings.showPaymentMethod ? `<p>Pago: ${escape(sale.paymentMethod)}</p>` : ""}${settings.showCashier ? `<p>Vendedor: ${escape(sale.employeeName)}</p>` : ""}<p>Cliente: ${escape(sale.customerName)}</p>
    <table><tbody>${rows}</tbody></table>${sale.note ? `<p>Nota: ${escape(sale.note)}</p>` : ""}
    <p>Subtotal: ${escape(money.format(sale.subtotal))}</p><p>Descuento: -${escape(money.format(sale.discountApplied))}</p><p>Impuestos: ${escape(money.format(sale.taxesApplied))}</p><p class="total"><strong>Total: ${escape(money.format(sale.total))} ${escape(sale.currency)}</strong></p>
    ${sale.amountReceived !== null ? `<p>Total recibido: ${escape(money.format(sale.amountReceived))}</p>${sale.paymentMethod.toUpperCase() === "EFECTIVO" ? `<p>Cambio: ${escape(money.format(Math.max(0, sale.amountReceived-sale.total)))}</p>` : ""}` : ""}${ticketFooterHtml(settings)}</main></body></html>`;
}
