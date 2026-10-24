import assert from "node:assert/strict";
import { FetchHttpClient } from "../../../src/new/core/api/FetchHttpClient";

export async function run(): Promise<void> {
  const originalFetch = globalThis.fetch;
  const headers: HeadersInit[] = [];
  globalThis.fetch = async (_input, init) => {
    headers.push(init?.headers ?? {});
    return new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } });
  };

  try {
    const client = new FetchHttpClient("https://example.test/");
    await client.request({ method: "POST", path: "orders", idempotencyKey: "sale-1", body: {} });
    await client.request({ method: "GET", path: "orders" });

    assert.equal(new Headers(headers[0]).get("Idempotency-Key"), "sale-1");
    assert.equal(new Headers(headers[1]).get("Idempotency-Key"), null);
  } finally {
    globalThis.fetch = originalFetch;
  }
}
