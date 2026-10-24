import assert from "node:assert/strict";
import { formatSaleTicket, shareSaleTicket, type CompletedSale } from "../../../../src/new/systems/pos/features/sales/ui/saleTicket";

export async function run() {
  const sale: CompletedSale = {
    folio: "POS/7", paymentMethodLabel: "EFECTIVO", table: "General", subtotal: 100,
    discount: 10, taxAmount: 14.4, taxableBase: 90, taxDescription: "IVA", total: 104.4,
    createdAt: "2026-10-22T12:00:00Z", customerName: "Ana",
    items: [{name: "Café", quantity: 2, unitPrice: 50, lineTotal: 100}],
  };
  const globals = ["navigator", "document", "window", "URL"] as const;
  const previous = globals.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)] as const);
  const setGlobal = (key: string, value: unknown) => Object.defineProperty(globalThis, key, {value, configurable: true, writable: true});
  try {
    setGlobal("window", {localStorage: {getItem: () => null}});
    const text = formatSaleTicket(sale, "Mi tienda");
    for (const value of ["Mi tienda", "POS/7", "2 x Café", "100.00", "104.40", "14.40", "10.00", "Ana", "IVA"]) assert.ok(text.includes(value), value);
    assert.throws(() => formatSaleTicket({...sale, total: NaN}, ""), /válidos/);
    assert.throws(() => formatSaleTicket({...sale, items: []}, ""), /válidos/);
    assert.throws(() => formatSaleTicket({...sale, items: [{...sale.items[0], quantity: 0}]}, ""), /válidos/);
    assert.ok(formatSaleTicket({...sale, total: 0, subtotal: 0, discount: 0, taxAmount: 0}, "").includes("Mi negocio"));

    let shared: ShareData | undefined;
    setGlobal("navigator", {share: async (data: ShareData) => {shared = data;}});
    assert.equal(await shareSaleTicket(sale, "Mi tienda"), "shared");
    assert.equal(shared?.text, text);
    assert.equal(shared?.title, "Ticket POS/7");
    setGlobal("navigator", {share: async () => {throw new DOMException("Cancelled", "AbortError");}});
    assert.equal(await shareSaleTicket(sale, "Mi tienda"), "cancelled");
    setGlobal("navigator", {share: async () => {throw new Error("No permitido");}});
    await assert.rejects(() => shareSaleTicket(sale, "Mi tienda"), /No permitido/);

    let clicked = false, removed = false, revoked = false;
    let blob: Blob | undefined;
    let cleanup: (() => void) | undefined;
    const link = {href: "", download: "", click: () => {clicked = true;}, remove: () => {removed = true;}};
    setGlobal("navigator", {});
    setGlobal("URL", {createObjectURL: (value: Blob) => {blob = value; return "blob:ticket";}, revokeObjectURL: (value: string) => {assert.equal(value, "blob:ticket"); revoked = true;}});
    setGlobal("document", {createElement: (tag: string) => {assert.equal(tag, "a"); return link;}, body: {appendChild: (node: unknown) => assert.equal(node, link)}});
    setGlobal("window", {localStorage: {getItem: () => null}, setTimeout: (fn: () => void) => {cleanup = fn;}});
    assert.equal(await shareSaleTicket(sale, "Mi tienda"), "downloaded");
    assert.equal(await blob?.text(), text);
    assert.equal(blob?.type, "text/plain;charset=utf-8");
    assert.equal(link.download, "ticket-POS-7.txt");
    assert.ok(clicked && removed);
    cleanup?.(); assert.ok(revoked);
  } finally {
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
}
