export type LoginSessionLimitPayload = {
  code: "PLAN_DEVICE_LIMIT_EXCEEDED";
  error?: string;
  plan: string;
  role: string;
  businessId?: number;
  employeeId?: number;
};

export type LoginFailureState = {
  sessionLimit: LoginSessionLimitPayload | null;
  error: string | null;
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" ? value as Record<string, unknown> : null;

export const processLoginFailure = (cause: unknown): LoginFailureState => {
  const error = cause as Error & { payload?: unknown };
  const payload = asRecord(error?.payload);

  if (payload?.code === "PLAN_DEVICE_LIMIT_EXCEEDED") {
    return {
      sessionLimit: {
        code: "PLAN_DEVICE_LIMIT_EXCEEDED",
        error: typeof payload.error === "string" ? payload.error : undefined,
        plan: String(payload.plan ?? ""),
        role: String(payload.role ?? ""),
        businessId: typeof payload.businessId === "number" ? payload.businessId : undefined,
        employeeId: typeof payload.employeeId === "number" ? payload.employeeId : undefined,
      },
      error: null,
    };
  }

  return {
    sessionLimit: null,
    error: cause instanceof Error
      ? cause.message
      : "No se pudo iniciar sesión en POS v2.",
  };
};

export const canIncreaseSessionLimit = (payload: LoginSessionLimitPayload): boolean =>
  payload.plan.trim().toUpperCase() !== "MAX";

export const getSessionClosurePath = (payload: LoginSessionLimitPayload): string => {
  const isAdministrator = payload.role.trim().toUpperCase() === "ADMINISTRADOR";
  const id = Number(isAdministrator ? payload.businessId : payload.employeeId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("No se recibió un identificador válido para cerrar las sesiones.");
  }

  return `business/deviceidentifier/${isAdministrator ? "business" : "employee"}/${id}`;
};
