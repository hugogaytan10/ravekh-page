export type CatalogBranchContext = {
  businessId: string;
  branchId: number | null;
  branchSlug: string | null;
  branchName: string | null;
  isMain: boolean;
  phone: string | null;
};

const BUSINESS_KEY = "idBusiness";
const BRANCH_ID_KEY = "catalog-v2-branch-id";
const BRANCH_SLUG_KEY = "catalog-v2-branch-slug";
const BRANCH_NAME_KEY = "catalog-v2-branch-name";
const BRANCH_MAIN_KEY = "catalog-v2-branch-main";
const PHONE_KEY = "telefono";

const normalizeSlug = (value?: string | null) => {
  const slug = String(value ?? "").trim();
  return slug || null;
};

export const buildCatalogPath = (businessId: string | number, branchSlug?: string | null) => {
  const normalizedBusinessId = String(businessId ?? "").trim();
  const slug = normalizeSlug(branchSlug);
  return slug ? `/v2/catalogo/${normalizedBusinessId}/${encodeURIComponent(slug)}` : `/v2/catalogo/${normalizedBusinessId}`;
};

export const getCatalogCartKey = (businessId: string | number, branchSlug?: string | null) => {
  const normalizedBusinessId = String(businessId ?? "").trim();
  const slug = normalizeSlug(branchSlug) ?? "main";
  return `catalog-v2-cart:${normalizedBusinessId}:${slug}`;
};

export const getPendingStripeCatalogOrderKey = (businessId: string | number, branchSlug?: string | null) => {
  const normalizedBusinessId = String(businessId ?? "").trim();
  const slug = normalizeSlug(branchSlug) ?? "main";
  return `catalog-v2-pending-stripe-order:${normalizedBusinessId}:${slug}`;
};

export const persistCatalogBranchContext = (context: CatalogBranchContext) => {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(BUSINESS_KEY, context.businessId);
  if (context.branchId != null) window.localStorage.setItem(BRANCH_ID_KEY, String(context.branchId));
  else window.localStorage.removeItem(BRANCH_ID_KEY);

  if (context.branchSlug) window.localStorage.setItem(BRANCH_SLUG_KEY, context.branchSlug);
  else window.localStorage.removeItem(BRANCH_SLUG_KEY);

  if (context.branchName) window.localStorage.setItem(BRANCH_NAME_KEY, context.branchName);
  else window.localStorage.removeItem(BRANCH_NAME_KEY);

  window.localStorage.setItem(BRANCH_MAIN_KEY, context.isMain ? "1" : "0");

  if (context.phone) window.localStorage.setItem(PHONE_KEY, context.phone);
  else window.localStorage.removeItem(PHONE_KEY);
};

export const readCatalogBranchContext = (): CatalogBranchContext => {
  if (typeof window === "undefined") {
    return {
      businessId: "",
      branchId: null,
      branchSlug: null,
      branchName: null,
      isMain: true,
      phone: null,
    };
  }

  const branchIdRaw = window.localStorage.getItem(BRANCH_ID_KEY);
  const branchId = branchIdRaw ? Number(branchIdRaw) : null;

  return {
    businessId: window.localStorage.getItem(BUSINESS_KEY) ?? "",
    branchId: branchId != null && Number.isFinite(branchId) ? branchId : null,
    branchSlug: normalizeSlug(window.localStorage.getItem(BRANCH_SLUG_KEY)),
    branchName: window.localStorage.getItem(BRANCH_NAME_KEY),
    isMain: window.localStorage.getItem(BRANCH_MAIN_KEY) !== "0",
    phone: window.localStorage.getItem(PHONE_KEY),
  };
};
