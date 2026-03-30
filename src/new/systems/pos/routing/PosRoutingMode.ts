export type PosRoutingMode = "modern";

export const POS_ROUTING_MODE_KEY = "pos-routing-mode";

export const getStoredPosRoutingMode = (): PosRoutingMode => {
  const current = window.localStorage.getItem(POS_ROUTING_MODE_KEY);
  if (current !== "modern") {
    window.localStorage.setItem(POS_ROUTING_MODE_KEY, "modern");
  }

  return "modern";
};

export const savePosRoutingMode = (mode: PosRoutingMode): void => {
  window.localStorage.setItem(POS_ROUTING_MODE_KEY, mode);
};
