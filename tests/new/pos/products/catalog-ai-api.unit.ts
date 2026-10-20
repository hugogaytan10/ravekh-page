import assert from "node:assert/strict";
import {CatalogAiApi} from "../../../../src/new/systems/pos/features/products/api/CatalogAiApi";

export const run = async () => {
  const originalFetch = globalThis.fetch;
  const originalWindow = globalThis.window;
  const calls: Array<{url: string; init: RequestInit}> = [];
  let branchId = 42;
  let status = 200;
  let payload: unknown = {batchId: "batch"};
  globalThis.window = {localStorage: {getItem: (key: string) => key === "pos-v2-branch-id" ? String(branchId) : null}} as any;
  globalThis.fetch = async (url, init) => {
    calls.push({url: String(url), init: init!});
    return new Response(JSON.stringify(payload), {status});
  };
  try {
    const api = new CatalogAiApi("https://example.com/", "Bearer token");
    branchId = 43;
    await api.createBatch(9);
    assert.equal(JSON.parse(String(calls[0].init.body)).branchId, 42);
    assert.equal(new Headers(calls[0].init.headers).get("X-Branch-Id"), "42");
    assert.equal(new Headers(calls[0].init.headers).get("Authorization"), "Bearer token");
    status = 500; payload = {error: "INTERNAL_ERROR", requestId: "request-123"};
    await assert.rejects(() => api.createBatch(1), (error: Error) => error.message.includes("Referencia: request-123") && !error.message.includes("INTERNAL_ERROR"));
    status = 403; payload = {error: "BRANCH_ACCESS_DENIED", message: "No tienes acceso a esta sucursal."};
    await assert.rejects(() => api.createBatch(1), (error: Error) => error.message === "No tienes acceso a esta sucursal.");
  } finally {globalThis.fetch = originalFetch; globalThis.window = originalWindow;}
};
