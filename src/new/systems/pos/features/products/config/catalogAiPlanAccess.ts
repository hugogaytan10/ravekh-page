const PLAN_LIMITS: Record<string, number> = {
  GRATUITO: 0,
  PRUEBA: 0,
  "GRATUITO ONLINE": 0,
  START: 100,
  EMPRENDEDOR: 100,
  EMPRESARIAL: 100,
  INICIAL: 100,
  BASICO: 100,
  PRO: 250,
  MAX: 500,
};

export const CATALOG_AI_BATCH_LIMIT = 50;

export const getCatalogAiImportQuota = (...plans: Array<string | null | undefined>) => {
  const limits = plans
    .map((plan) => PLAN_LIMITS[String(plan ?? "").trim().toUpperCase()])
    .filter((limit): limit is number => limit !== undefined);

  return limits.length ? Math.min(...limits) : 0;
};
