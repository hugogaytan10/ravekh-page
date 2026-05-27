export const POS_BUSINESS_UPDATED_EVENT = "pos-v2-business-updated";

export type PosBusinessUpdatedDetail = {
  businessId: number;
  source?: string;
};

export const emitPosBusinessUpdated = (detail: PosBusinessUpdatedDetail): void => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<PosBusinessUpdatedDetail>(POS_BUSINESS_UPDATED_EVENT, { detail }));
};

export const onPosBusinessUpdated = (listener: (detail: PosBusinessUpdatedDetail) => void): (() => void) => {
  if (typeof window === "undefined") return () => undefined;

  const handler = (event: Event) => {
    const custom = event as CustomEvent<PosBusinessUpdatedDetail>;
    const detail = custom.detail;
    if (!detail || !Number.isFinite(detail.businessId) || detail.businessId <= 0) return;
    listener(detail);
  };

  window.addEventListener(POS_BUSINESS_UPDATED_EVENT, handler as EventListener);
  return () => window.removeEventListener(POS_BUSINESS_UPDATED_EVENT, handler as EventListener);
};
