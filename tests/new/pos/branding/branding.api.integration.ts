import assert from "node:assert/strict";
import { PosBrandingApi } from "../../../../src/new/systems/pos/features/settings/branding/api/PosBrandingApi";

export async function run(): Promise<void> {
  const calls: string[] = [];
  let updateBody: unknown;

  const httpClient = {
    request: async ({ method, path, body }: { method: string; path: string; body?: unknown }) => {
      calls.push(`${method} ${path}`);

      if (method === "PUT" && path === "business/7") {
        updateBody = body;
        return { affectedRows: 1, changedRows: 1 };
      }

      throw new Error(`Unexpected request ${method} ${path}`);
    },
  };

  const api = new PosBrandingApi(httpClient);
  const saved = await api.update(7, {
    name: "Café Nuevo",
    address: "Calle 2",
    phoneNumber: "555-0202",
    logo: "data:image/png;base64,updated-logo",
    color: "#6D01D1",
    references: "Frente al parque",
  }, "token");

  assert.deepEqual(calls, ["PUT business/7"]);
  assert.deepEqual(updateBody, {
    Name: "Café Nuevo",
    Address: "Calle 2",
    PhoneNumber: "555-0202",
    Logo: "data:image/png;base64,updated-logo",
    Color: "#6D01D1",
    References: "Frente al parque",
  });
  assert.equal(saved.businessId, 7);
  assert.equal(saved.name, "Café Nuevo");
  assert.equal(saved.address, "Calle 2");
  assert.equal(saved.phoneNumber, "555-0202");
  assert.equal(saved.logo, "data:image/png;base64,updated-logo");
  assert.equal(saved.color, "#6D01D1");
  assert.equal(saved.references, "Frente al parque");
}
