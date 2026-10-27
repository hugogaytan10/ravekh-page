export type TicketCustomization = {
  showLogo: boolean; showBusinessPhone: boolean; businessPhone: string;
  showBusinessAddress: boolean; businessAddress: string; showRfc: boolean; rfc: string;
  showReturnPolicy: boolean; returnPolicy: string; showVisitQr: boolean;
  showPaymentMethod: boolean; showCashier: boolean; footerMessage: string;
};

export const DEFAULT_TICKET_CUSTOMIZATION: TicketCustomization = {
  showLogo: true, showBusinessPhone: true, businessPhone: "",
  showBusinessAddress: true, businessAddress: "", showRfc: false, rfc: "",
  showReturnPolicy: false, returnPolicy: "Cambios y devoluciones sujetos a las políticas del establecimiento.",
  showVisitQr: true, showPaymentMethod: true, showCashier: true, footerMessage: "Gracias por tu compra.",
};

const key = (businessId: number) => `@ravekh/ticket-customization/v1/${businessId}`;
export const normalizeTicketCustomization = (value: unknown): TicketCustomization => {
  const result = { ...DEFAULT_TICKET_CUSTOMIZATION };
  if (!value || typeof value !== "object") return result;
  for (const field of Object.keys(result) as Array<keyof TicketCustomization>) {
    const next = (value as Record<string, unknown>)[field];
    if (typeof next === typeof result[field]) Object.assign(result, { [field]: next });
  }
  return result;
};

// shortcut: preferencias locales como en móvil; migrar al servidor cuando exista API de tickets.
export const readTicketCustomization = (businessId: number): TicketCustomization => {
  try { return normalizeTicketCustomization(JSON.parse(window.localStorage.getItem(key(businessId)) || "null")); }
  catch { return { ...DEFAULT_TICKET_CUSTOMIZATION }; }
};
export const saveTicketCustomization = (businessId: number, value: TicketCustomization) => {
  if (!Number.isInteger(businessId) || businessId < 1) throw new Error("No hay negocio activo.");
  window.localStorage.setItem(key(businessId), JSON.stringify(normalizeTicketCustomization(value)));
};

export const escapeTicketHtml = (value: unknown): string => String(value ?? "").replace(/[&<>"']/g,
  character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);

export const ticketContactHtml = (settings: TicketCustomization, phone = "", address = ""): string => [
  settings.showBusinessPhone && (settings.businessPhone || phone) ? `<p>Tel: ${escapeTicketHtml(settings.businessPhone || phone)}</p>` : "",
  settings.showBusinessAddress && (settings.businessAddress || address) ? `<p>${escapeTicketHtml(settings.businessAddress || address)}</p>` : "",
  settings.showRfc && settings.rfc ? `<p>RFC: ${escapeTicketHtml(settings.rfc)}</p>` : "",
].join("");

export const ticketFooterHtml = (settings: TicketCustomization): string => [
  settings.showReturnPolicy && settings.returnPolicy ? `<p>${escapeTicketHtml(settings.returnPolicy)}</p>` : "",
  settings.footerMessage ? `<p>${escapeTicketHtml(settings.footerMessage)}</p>` : "",
].join("");
