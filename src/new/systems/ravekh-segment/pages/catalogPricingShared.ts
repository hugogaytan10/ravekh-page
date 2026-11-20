import {OFFICIAL_MONTHLY_PRICES,PLAN_DETAILS,type OfficialPaidPlan} from "../../pos/shared/config/posPlanDetails";
type UnlockPlanKey = OfficialPaidPlan;

export type VerticalCatalogPlan = {
  name: string;
  price: string;
  periodLabel: string;
  limit: string;
  benefits: string[];
  recommended?: boolean;
  checkoutPlanKey?: UnlockPlanKey;
};

export type CatalogCheckoutPlan = {
  name: string;
  amount: number;
  plan: UnlockPlanKey;
};

export const LOGIN_POS_PATH = "/login-punto-venta";
export const FREE_CATALOG_PLAN_NAME = "Catálogo Gratuito";

export const catalogPlans: VerticalCatalogPlan[] = [
  {
    name: FREE_CATALOG_PLAN_NAME,
    price: "$0 MXN",
    periodLabel: "Gratis",
    limit: "Prueba el catálogo y el punto de venta",
    benefits: PLAN_DETAILS.GRATUITO.benefits,
  },
  {
    name: "Essential",
    price: `$${OFFICIAL_MONTHLY_PRICES.ESSENTIAL} MXN`,
    periodLabel: "al mes",
    limit: "Publica y vende sin límite",
    benefits: PLAN_DETAILS.ESSENTIAL.benefits,
    checkoutPlanKey: "ESSENTIAL",
  },
  {
    name: "Start",
    price: `$${OFFICIAL_MONTHLY_PRICES.START} MXN`,
    periodLabel: "al mes",
    limit: "Opera tu negocio",
    benefits: PLAN_DETAILS.START.benefits,
    recommended: true,
    checkoutPlanKey: "START",
  },
  {
    name: "Pro",
    price: `$${OFFICIAL_MONTHLY_PRICES.PRO} MXN`,
    periodLabel: "al mes",
    limit: "Administra tu negocio",
    benefits: PLAN_DETAILS.PRO.benefits,
    checkoutPlanKey: "PRO",
  },
];

export const buildCatalogCheckoutPlan = (plan: VerticalCatalogPlan): CatalogCheckoutPlan | null => {
  if (!plan.checkoutPlanKey) return null;

  return {
    name: plan.name,
    amount: OFFICIAL_MONTHLY_PRICES[plan.checkoutPlanKey],
    plan: plan.checkoutPlanKey,
  };
};

export const hasStoredPosSession = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(
    window.localStorage.getItem("pos.auth.token") ||
      window.localStorage.getItem("pos-v2.auth.token") ||
      window.sessionStorage.getItem("pos.auth.token") ||
      window.sessionStorage.getItem("pos-v2.auth.token"),
  );
};
