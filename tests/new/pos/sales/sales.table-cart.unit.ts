import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const { transformSync } = createRequire(import.meta.url)("esbuild");

export async function run() {
  const source = readFileSync("src/new/systems/pos/features/sales/ui/PosV2SalesHomePage.tsx", "utf8");
  const loadEnd = source.indexOf("  }, [products, selectedTableId]);");
  const loadStart = source.lastIndexOf("  useEffect(() => {", loadEnd);
  const syncEnd = source.indexOf("  }, [cart, selectedTableId]);", loadEnd);
  const effects = source.slice(loadStart, syncEnd + "  }, [cart, selectedTableId]);".length);
  assert.ok(loadStart > 0 && syncEnd > loadEnd, "Se prueban los efectos reales de cargar y sincronizar mesas");
  const code = transformSync("const cleanups = []; const useEffect = fn => { const cleanup = fn(); if (cleanup) cleanups.push(cleanup); };\n" + effects, {loader: "ts", format: "cjs"}).code;
  const saved = {Name: "Golden Necklace", Quantity: 1, total: 600};
  const server = new Map([["2", [saved]], ["3", [{Name: "Café"}]], ["4", [{Name: "Agua"}]]]);
  const state = {cart: {necklace: saved} as Record<string, unknown>, customer: "7", percent: "10", fixed: "60", error: ""};
  const refs = {
    activeTableDraftRef: {current: "2"}, loadingTableDraftRef: {current: false},
    skippingDraftSyncRef: {current: false}, keepCartForNextTableSelectionRef: {current: false},
    discountSourceRef: {current: "fixed"},
  };
  const calls: Array<{url: string; options: {method?: string}}> = [];
  const requests: Array<(response: unknown) => void> = [];
  const timers = new Map<number, () => void>();
  let timerId = 0;
  const render = (tableId: string) => {
    const runtime = {
      ...refs, selectedTableId: tableId, products: [], cart: state.cart,
      API_BASE_URL: "https://example.test/", getCurrentSession: () => ({token: "token"}),
      buildPosAuthHeaders: () => ({}),
      setCart: (value: Record<string, unknown>) => {state.cart = value;},
      setSelectedCustomerId: (value: string) => {state.customer = value;},
      setDiscountPercent: (value: string) => {state.percent = value;},
      setFixedDiscount: (value: string) => {state.fixed = value;},
      setValidationError: (value: string) => {state.error = value;},
      resolveCartItemFromTableDraft: (row: {Name: string}) => ({cartKey: row.Name, ...row}),
      fetch: (url: string, options: {method?: string}) => {
        calls.push({url, options});
        return new Promise(resolve => requests.push(resolve));
      },
      window: {setTimeout: (fn: () => void) => {timers.set(++timerId, fn); return timerId;}, clearTimeout: (id: number) => timers.delete(id)},
    };
    return new Function(...Object.keys(runtime), code + "\nreturn cleanups;")(...Object.values(runtime)) as Array<() => void>;
  };
  const resolveRequest = async (index: number, tableId: string) => {
    requests[index]({ok: true, json: async () => server.get(tableId)});
    await new Promise(resolve => setImmediate(resolve));
  };

  render("");
  assert.deepEqual(state.cart, {}, "Salir de una comanda debe vaciar el carrito general sin cobrar");
  assert.equal(state.customer, "");
  assert.equal(state.percent, "0");
  assert.equal(state.fixed, "0");
  assert.equal(calls.length, 0, "Salir de la mesa no borra su cuenta del servidor");
  assert.equal(server.get("2")?.[0], saved);

  const directCart = {direct: {Name: "Venta directa"}};
  state.cart = directCart;
  render("");
  assert.equal(state.cart, directCart, "Un carrito sin mesa debe conservarse");
  refs.keepCartForNextTableSelectionRef.current = true;
  render("2");
  assert.equal(state.cart, directCart, "Asignar la venta directa a una mesa conserva los productos");
  assert.equal(calls[0].options.method, "PUT");
  requests[0]({ok: true});
  await new Promise(resolve => setImmediate(resolve));

  const cleanup3 = render("3");
  assert.deepEqual(state.cart, {}, "Cambiar de mesa no muestra productos de la mesa anterior");
  cleanup3.forEach(cleanup => cleanup());
  const cleanup4 = render("4");
  await resolveRequest(1, "3");
  assert.deepEqual(state.cart, {}, "Una respuesta antigua no debe repoblar el carrito");
  assert.equal(refs.loadingTableDraftRef.current, true, "La respuesta antigua no desbloquea la carga nueva");
  await resolveRequest(2, "4");
  assert.ok(state.cart.Agua, "Se carga la cuenta de la mesa seleccionada");
  assert.equal(state.error, "");
  cleanup4.forEach(cleanup => cleanup());
  const lateCleanup = render("2");
  lateCleanup.forEach(cleanup => cleanup());
  render("");
  await resolveRequest(3, "2");
  assert.deepEqual(state.cart, {}, "Volver a Sin mesa permanece vacío incluso si llega la carga anterior");
  assert.ok(calls.every(call => call.options.method !== "DELETE"), "Vaciar el carrito local nunca elimina la comanda pendiente");
  assert.equal(server.get("2")?.[0], saved);
}
