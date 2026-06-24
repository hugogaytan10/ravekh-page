import type { UnlockPlanKey } from "../../pos/shared/ui/FeatureUnlockModal";

export type BillingCycle = "monthly" | "annual";

export type VerticalCatalogPlan = {
  name: string;
  prices: Record<BillingCycle, string>;
  periodLabel: Record<BillingCycle, string>;
  limit: string;
  benefits: string[];
  recommended?: boolean;
  annualNote?: string;
  checkoutPlanKey?: UnlockPlanKey;
};

export type CatalogCheckoutPlan = {
  name: string;
  amount: number;
  plan: UnlockPlanKey;
};

export const LOGIN_POS_PATH = "/login-punto-venta";
export const FREE_CATALOG_PLAN_NAME = "Catálogo Gratuito";

export const billingCycleCopy: Record<BillingCycle, { label: string; helper: string }> = {
  monthly: {
    label: "Mensual",
    helper: "Paga mes a mes y cambia de plan cuando tu negocio lo necesite.",
  },
  annual: {
    label: "Anual",
    helper: "Paga una vez al año y deja tu catálogo cubierto por 12 meses.",
  },
};

export const catalogPlans: VerticalCatalogPlan[] = [
  {
    name: FREE_CATALOG_PLAN_NAME,
    prices: { monthly: "0.00 MXN", annual: "0.00 MXN" },
    periodLabel: { monthly: "Gratis", annual: "Gratis" },
    limit: "Límite de productos/fotos editable",
    benefits: [
      "Link de catálogo",
      "1 Imagen por producto",
      "50 Visitas al mes por catálogo",
      "Sin acceso a impuesto por venta",
      "Guardado 100% offline",
    ],
  },
  {
    name: "Catálogo Básico",
    prices: { monthly: "299.00 MXN", annual: "2,988.00 MXN" },
    periodLabel: { monthly: "al mes", annual: "al año" },
    limit: "Perfecto para empezar con un catálogo simple",
    benefits: [
      "Importación masiva",
      "Acceso a reportes",
      "Productos Ilimitados 1 imagen por producto",
      "Sincronización en la nube",
    ],
    recommended: true,
    annualNote: "Equivale a $249 MXN al mes",
    checkoutPlanKey: "START",
  },
  {
    name: "Catálogo Intermedio",
    prices: { monthly: "599.00 MXN", annual: "5,988.00 MXN" },
    periodLabel: { monthly: "al mes", annual: "al año" },
    limit: "Para negocios con más variedad de productos",
    benefits: [
      "Todo lo del plan Básico",
      "Mayor capacidad de productos",
      "Mejor seguimiento comercial",
      "Preparado para crecer a POS",
    ],
    annualNote: "Equivale a $499 MXN al mes",
    checkoutPlanKey: "PRO",
  },
  {
    name: "Catálogo Pro",
    prices: { monthly: "1299.00 MXN", annual: "13,788.00 MXN" },
    periodLabel: { monthly: "al mes", annual: "al año" },
    limit: "Límite de productos/fotos editable",
    benefits: [
      "Todo lo del plan Intermedio",
      "Capacidad de productos personalizada",
      "Soporte prioritario",
      "100 Facturas timbradas al mes ante el SAT",
    ],
    annualNote: "Equivale a $1,149 MXN al mes",
    checkoutPlanKey: "MAX",
  },
];

export const parsePlanAmount = (price: string) => {
  const amount = Number(price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(amount) ? amount : 0;
};

export const buildCatalogCheckoutPlan = (plan: VerticalCatalogPlan, billingCycle: BillingCycle): CatalogCheckoutPlan | null => {
  if (!plan.checkoutPlanKey) {
    return null;
  }

  return {
    name: plan.name,
    amount: parsePlanAmount(plan.prices[billingCycle]),
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
