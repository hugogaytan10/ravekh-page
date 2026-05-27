import assert from "node:assert/strict";
import { LoyaltyApi } from "../../../../src/new/systems/loyalty/rewards-management/api/LoyaltyApi";

export async function run(): Promise<void> {
  const calls: Array<{ method: string; path: string; body?: unknown }> = [];

  const httpClient = {
    request: async ({ method, path, body }: { method: string; path: string; body?: unknown }) => {
      calls.push({ method, path, body });

      if (method === "GET" && path === "visits/business/12") {
        return {
          visits: [
            { Id: 3, Business_Id: 12, User_Id: 7, UserName: "Ana", Date: "2026-03-20T10:00:00Z", VisitCount: 1, TotalVisits: 4 },
            { Id: 4, Business_Id: 12, User_Id: 7, UserName: "Ana", Date: "2026-03-21T10:00:00Z", VisitCount: 1, TotalVisits: 5 },
          ],
        };
      }

      if (method === "POST" && path === "visits/qr/redeem") {
        const redeemError = new Error("bad gateway") as Error & { payload?: unknown; status?: number };
        redeemError.status = 502;
        redeemError.payload = { visitCreated: true, couponGenerated: false };
        throw redeemError;
      }

      if (method === "POST" && path === "coupons") {
        return 321;
      }

      throw new Error(`Unexpected call ${method} ${path}`);
    },
  };

  const api = new LoyaltyApi(httpClient as never);

  const visits = await api.getVisitHistory(12, "token");
  assert.equal(visits.length, 2);
  assert.equal(visits[0]?.id, 4, "history should be sorted by latest date first");

  const redeemed = await api.redeemVisitQr({ token: "abc", userId: 99 }, "token");
  assert.equal(redeemed.visitCreated, true);
  assert.equal(redeemed.couponGenerated, false);

  const created = await api.createCoupon({ businessId: 12, qr: "QR-ABCDE-1234", description: "Promo", maxRedemptions: 5 }, "token");
  assert.equal(created.id, 321);
  assert.equal(created.qr, "QR-ABCDE-1234");

  assert.deepEqual(
    calls.map((call) => `${call.method} ${call.path}`),
    ["GET visits/business/12", "POST visits/qr/redeem", "POST coupons"],
  );
}
