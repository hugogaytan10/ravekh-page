import assert from "node:assert/strict";
import { PosBusinessSettingsApi } from "../../../../src/new/systems/pos/features/settings/business/api/PosBusinessSettingsApi";

export async function run(): Promise<void> {
  const calls: string[] = [];
  let updateBody: unknown;

  const httpClient = {
    request: async ({ method, path, body }: { method: string; path: string; body?: unknown }) => {
      calls.push(`${method} ${path}`);

      if (method === "GET" && path === "business/7") {
        return {
          Id: 7,
          Name: "Café RAVEKH",
          ChangesNoticeViewed: 0,
          ChangesNoticeViewedAt: null,
        };
      }

      if (method === "PUT" && path === "business/changes-notice/7") {
        updateBody = body;
        return { Id: 7, Name: "Café RAVEKH", ...body as object };
      }

      throw new Error(`Unexpected request ${method} ${path}`);
    },
  };

  const api = new PosBusinessSettingsApi(httpClient);
  const settings = await api.getChangesNoticeStatus(7, "token");

  assert.equal(settings.viewed, false);
  assert.equal(settings.viewedAt, null);

  await api.acknowledgeChangesNotice(7, "token");

  assert.deepEqual(updateBody, {
    ChangesNoticeViewed: 1,
  });
  assert.deepEqual(calls, [
    "GET business/7",
    "PUT business/changes-notice/7",
  ]);
}
