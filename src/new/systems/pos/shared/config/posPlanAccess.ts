export type PosPlan =  "GRATUITO" | "START" | "PRO" | "MAX";

export type PlanProtectedAction =
  | "products.printPdf"
  | "products.exportExcel"
  | "reports.advanced"
  | "reports.export"
  | "settings.tableZones"
  | "customers.manage"
  | "employees.manage"
  | "employees.create"
  | "inventory.adjust"
  | "loyalty.coupons"
  | "loyalty.visits"
  | "loyalty.createCoupon"
  | "catalog.advancedCustomization"
  | "cashClosing.export";

export type PlanActionRule = {
  requiredPlan: PosPlan;
  title: string;
  message: string;
  ctaLabel?: string;
};

export const POS_PLAN_LEVELS: Record<PosPlan, number> = {
  OFFLINE: 0,
  GRATUITO: 1,
  START: 2,
  PRO: 3,
  MAX: 4,
};

const POS_PLAN_ALIASES: Record<string, PosPlan> = {
  PRUEBA: "GRATUITO",
  "GRATUITO ONLINE": "GRATUITO",
  EMPRESARIAL: "START",
  VIP: "MAX",
  "CONTROL TOTAL": "MAX",
  INICIAL: "START",
  BASICO: "START",
  INTERMEDIO: "PRO",
};

export const POS_PLAN_ACTION_RULES: Record<PlanProtectedAction, PlanActionRule> = {
  "products.printPdf": {
    requiredPlan: "START",
    title: "Impresión en PDF bloqueada",
    message: "Actualiza tu plan para acceder a esta función. La impresión en PDF está disponible desde el plan START.",
  },
  "products.exportExcel": {
    requiredPlan: "START",
    title: "Exportación a Excel bloqueada",
    message: "Actualiza tu plan para acceder a esta función. La exportación a Excel está disponible desde el plan START.",
  },
  "reports.advanced": {
    requiredPlan: "PRO",
    title: "Reportes avanzados bloqueados",
    message: "Actualiza tu plan para acceder a esta función. Los reportes avanzados están disponibles desde el plan PRO.",
  },
  "reports.export": {
    requiredPlan: "PRO",
    title: "Exportar reportes bloqueado",
    message: "Actualiza tu plan para acceder a esta función. La exportación de reportes está disponible desde el plan PRO.",
  },
  "settings.tableZones": {
    requiredPlan: "START",
    title: "Mesas y zonas bloqueado",
    message: "Actualiza tu plan para acceder a esta función. Mesas y zonas está disponible desde el plan START.",
  },
  "customers.manage": {
    requiredPlan: "START",
    title: "Clientes bloqueado",
    message: "Actualiza tu plan para acceder a esta función. La gestión de clientes está disponible desde el plan START.",
  },
  "employees.manage": {
    requiredPlan: "START",
    title: "Empleados bloqueado",
    message: "Actualiza tu plan para acceder a esta función. La gestión de empleados está disponible desde el plan START.",
  },
  "employees.create": {
    requiredPlan: "START",
    title: "Gestión de empleados bloqueada",
    message: "Actualiza tu plan para acceder a esta función. La creación de empleados está disponible desde el plan START.",
  },
  "inventory.adjust": {
    requiredPlan: "PRO",
    title: "Ajustes de inventario bloqueados",
    message: "Actualiza tu plan para acceder a esta función. Los ajustes avanzados de inventario están disponibles desde el plan PRO.",
  },
  "loyalty.coupons": {
    requiredPlan: "START",
    title: "Cupones bloqueados",
    message: "Actualiza tu plan para acceder a esta función. Los cupones están disponibles desde el plan START.",
  },
  "loyalty.visits": {
    requiredPlan: "START",
    title: "Visitas bloqueadas",
    message: "Actualiza tu plan para acceder a esta función. El registro de visitas está disponible desde el plan START.",
  },
  "loyalty.createCoupon": {
    requiredPlan: "START",
    title: "Cupones bloqueados",
    message: "Actualiza tu plan para acceder a esta función. La creación de cupones está disponible desde el plan START.",
  },
  "catalog.advancedCustomization": {
    requiredPlan: "START",
    title: "Personalización avanzada bloqueada",
    message: "Actualiza tu plan para acceder a esta función. La personalización avanzada del catálogo está disponible desde el plan START.",
  },
  "cashClosing.export": {
    requiredPlan: "START",
    title: "Exportación de corte bloqueada",
    message: "Actualiza tu plan para acceder a esta función. La exportación de cortes está disponible desde el plan START.",
  },
};

export const normalizePosPlan = (rawPlan?: string | null): PosPlan => {
  const normalized = String(rawPlan ?? "").trim().toUpperCase();
  if (!normalized) return "GRATUITO";
  if (normalized === "OFFLINE") return "OFFLINE";
  if (normalized === "GRATUITO" || normalized === "START" || normalized === "PRO" || normalized === "MAX") return normalized;
  return POS_PLAN_ALIASES[normalized] ?? "GRATUITO";
};

export const hasRequiredPlan = (currentPlan: PosPlan, requiredPlan: PosPlan): boolean => {
if (currentPlan === "GRATUITO") return requiredPlan === "GRATUITO";
  return POS_PLAN_LEVELS[currentPlan] >= POS_PLAN_LEVELS[requiredPlan];
};

export const getPlanActionRule = (action: PlanProtectedAction): PlanActionRule => POS_PLAN_ACTION_RULES[action];
