import { CatalogStorefrontApi } from "../api/CatalogStorefrontApi";
import { getPosApiBaseUrl } from "../../../pos/shared/config/posEnv";

export type CatalogCheckoutOptionsData = {
  businessConfig: Awaited<ReturnType<CatalogStorefrontApi["getBusinessCheckoutConfig"]>>;
  shippingResponse: any;
};

const cache = new Map<number, CatalogCheckoutOptionsData>();
const pending = new Map<number, Promise<CatalogCheckoutOptionsData>>();

export const getCachedCatalogCheckoutOptions = (businessId: number) =>
  cache.get(businessId) ?? null;

export const loadCatalogCheckoutOptions = (
  api: CatalogStorefrontApi,
  businessId: number,
): Promise<CatalogCheckoutOptionsData> => {
  const cached = cache.get(businessId);
  if (cached) return Promise.resolve(cached);

  const existing = pending.get(businessId);
  if (existing) return existing;

  const request = Promise.all([
    api.getBusinessCheckoutConfig(String(businessId)),
    fetch(`${getPosApiBaseUrl().replace(/\/$/, "")}/shippingoptions/business/${businessId}`).then((response) =>
      response.ok ? response.json() : null,
    ),
  ])
    .then(([businessConfig, shippingResponse]) => {
      const result = { businessConfig, shippingResponse };
      cache.set(businessId, result);
      return result;
    })
    .finally(() => pending.delete(businessId));

  pending.set(businessId, request);
  return request;
};
