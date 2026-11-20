import { OFFICIAL_MONTHLY_PRICES, type UnlockPlanKey } from "../../pos/shared/ui/FeatureUnlockModal";

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
    benefits: ["50 productos", "1 imagen por producto", "50 visitas al catálogo al mes", "100 ventas POS al mes", "Reportes del día"],
  },
  {
    name: "Essential",
    price: `$${OFFICIAL_MONTHLY_PRICES.ESSENTIAL} MXN`,
    periodLabel: "al mes",
    limit: "Publica y vende sin límite",
    benefits: ["Productos, ventas y visitas ilimitados", "1 imagen por producto", "1 matriz", "1 empleado", "Reportes del día"],
    checkoutPlanKey: "ESSENTIAL",
  },
  {
    name: "Start",
    price: `$${OFFICIAL_MONTHLY_PRICES.START} MXN`,
    periodLabel: "al mes",
    limit: "Opera tu negocio",
    benefits: ["Productos, ventas, visitas y clientes ilimitados", "3 imágenes por producto", "4 mesas", "2 empleados más el dueño", "5 cupones activos", "Reportes básicos"],
    recommended: true,
    checkoutPlanKey: "START",
  },
  {
    name: "Pro",
    price: `$${OFFICIAL_MONTHLY_PRICES.PRO} MXN`,
    periodLabel: "al mes",
    limit: "Administra tu negocio",
    benefits: ["5 imágenes por producto", "Matriz y 1 sucursal", "5 empleados más el dueño", "50 cupones activos", "Análisis avanzado"],
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
