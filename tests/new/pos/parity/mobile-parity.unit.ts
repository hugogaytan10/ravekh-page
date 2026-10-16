import assert from "node:assert/strict";
import { DEFAULT_TICKET_CUSTOMIZATION, normalizeTicketCustomization, readTicketCustomization, saveTicketCustomization, ticketContactHtml, ticketFooterHtml } from "../../../../src/new/systems/pos/shared/config/posTicket";
import { resolvePosCurrency, persistPosCurrency, readPosCurrency, posMoneyFormatter } from "../../../../src/new/systems/pos/shared/config/posCurrency";
import { PosIntelligenceApi } from "../../../../src/new/systems/pos/features/intelligence/api/PosIntelligenceApi";
import { MORE_MODULE_SECTIONS } from "../../../../src/new/systems/pos/features/more/config/moreModules";
import { POS_V2_PATHS } from "../../../../src/new/systems/pos/routing/PosV2Paths";
import { HttpClient, HttpRequest } from "../../../../src/new/core/api/HttpClient";
import { validateAccountSettings, canDeleteOwnAccount } from "../../../../src/new/systems/pos/features/settings/model/accountSettings";

export async function run() {
  const values = new Map<string, string>();
  const original = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) } } });
  try {
    values.set("pos-v2-business-id", "7");
    assert.deepEqual(normalizeTicketCustomization({ showLogo: "false", rfc: 123 }), DEFAULT_TICKET_CUSTOMIZATION);
    saveTicketCustomization(7, { ...DEFAULT_TICKET_CUSTOMIZATION, showLogo: false, rfc: "RFC123" });
    assert.equal(readTicketCustomization(7).showLogo, false);
    assert.equal(readTicketCustomization(8).showLogo, true);
    values.set("@ravekh/ticket-customization/v1/9", "invalid json");
    assert.deepEqual(readTicketCustomization(9), DEFAULT_TICKET_CUSTOMIZATION);
    assert.throws(() => saveTicketCustomization(0, DEFAULT_TICKET_CUSTOMIZATION));
    const ticket = { ...DEFAULT_TICKET_CUSTOMIZATION, showRfc: true, rfc: '<img src=x onerror="bad()">', footerMessage: "<script>bad()</script>", showReturnPolicy: true, returnPolicy: "No & sí" };
    assert.ok(ticketContactHtml(ticket).includes("&lt;img"));
    assert.ok(!ticketContactHtml(ticket).includes("<img"));
    assert.ok(ticketFooterHtml(ticket).includes("No &amp; sí"));
    assert.ok(!ticketFooterHtml(ticket).includes("<script>"));
    assert.equal(ticketContactHtml({ ...ticket, showRfc: false }), "");
    assert.equal(resolvePosCurrency("BNY").iso, "CNY");
    assert.equal(resolvePosCurrency("eur").id, 4);
    assert.equal(resolvePosCurrency("unknown").code, "MXN");
    persistPosCurrency(7, "EUR");
    assert.equal(readPosCurrency().code, "EUR");
    assert.equal(posMoneyFormatter.format(12), new Intl.NumberFormat("es-MX", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(12));
    assert.equal(validateAccountSettings("Clemente", ""), "");
    assert.equal(validateAccountSettings("Clemente", "Clave1!"), "");
    assert.ok(validateAccountSettings(" ", "Clave1!"));
    assert.ok(validateAccountSettings("Clemente", "abc1!"));
    assert.ok(validateAccountSettings("Clemente", "abcdef!"));
    assert.ok(validateAccountSettings("Clemente", "abcdef1"));
    assert.equal(canDeleteOwnAccount(1, "ELIMINAR"), true);
    assert.equal(canDeleteOwnAccount(1, "eliminar"), false);
    assert.equal(canDeleteOwnAccount(0, "ELIMINAR"), false);
    assert.equal(canDeleteOwnAccount(1.5, "ELIMINAR"), false);
    values.set("pos-v2-business-id", "8");
    assert.equal(readPosCurrency().code, "MXN");
    const calls: HttpRequest[] = [];
    const api = new PosIntelligenceApi({ request: async (request: HttpRequest) => { calls.push(request); return {} as any; }, requestStatus: async () => 204 } as HttpClient);
    await api.load("token", true); await api.history("token"); await api.detail("token", 4); await api.markRead("token", 4); await api.dismiss("token", 4);
    assert.deepEqual(calls.map(call => [call.method, call.path]), [["GET", "intelligence"], ["GET", "intelligence/history"], ["GET", "intelligence/4"], ["POST", "intelligence/4/read"], ["POST", "intelligence/4/dismiss"]]);
    assert.deepEqual(calls[0].query, { refresh: 1 });
    assert.ok(calls.every(call => call.token === "token"));
    assert.throws(() => api.dismiss("token", 0)); assert.throws(() => api.detail("token", 1.5));
    const modules = MORE_MODULE_SECTIONS.flatMap(section => section.items);
    assert.equal(new Set(modules.map(item => item.id)).size, modules.length);
    for (const route of [POS_V2_PATHS.settings, POS_V2_PATHS.ticketSettings, POS_V2_PATHS.currency, POS_V2_PATHS.intelligence, POS_V2_PATHS.crm]) assert.ok(modules.some(item => item.path === route), route);
  } finally {
    if (original) Object.defineProperty(globalThis, "window", original); else Reflect.deleteProperty(globalThis, "window");
  }
}
