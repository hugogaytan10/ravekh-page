import { DynamicVisitQrToken, normalizeDynamicVisitQr } from "../../../../loyalty/rewards-management/model/RewardCoupon";

export const subscribeToDynamicVisitQr = (baseUrl: string, businessId: number, onQr: (qr: DynamicVisitQrToken) => void): (() => void) => {
  if (typeof EventSource === "undefined") return () => {};
  const url = new URL("visits/qr/dynamic/stream", baseUrl);
  url.searchParams.set("businessId", String(businessId));
  const stream = new EventSource(url.toString());
  const receive = (event: MessageEvent) => {
    let qr: DynamicVisitQrToken;
    try { qr = normalizeDynamicVisitQr(JSON.parse(event.data)); } catch { return; }
    onQr(qr);
  };
  stream.addEventListener("nextQr", receive);
  stream.addEventListener("message", receive);
  return () => stream.close();
};
