type CatalogAiLogLevel = "debug" | "info" | "warn" | "error";

type CatalogAiLogContext = Record<string, unknown>;

const REDACTED_KEYS = new Set([
  "authorization",
  "token",
  "accesstoken",
  "refreshtoken",
  "apikey",
  "api_key",
  "signature",
  "cloudinarysignature",
  "password",
  "secureurl",
  "secure_url",
  "imageurl",
  "image_url",
]);

const readDebugFlag = (): boolean => {
  const envValue = String(import.meta.env.VITE_CATALOG_AI_DEBUG ?? "").toLowerCase();
  if (["1", "true", "yes", "on"].includes(envValue)) return true;
  if (["0", "false", "no", "off"].includes(envValue)) return false;

  try {
    const localValue = window.localStorage.getItem("catalog-ai-debug");
    if (localValue !== null) {
      return ["1", "true", "yes", "on"].includes(localValue.toLowerCase());
    }
  } catch {
    // localStorage puede no estar disponible en navegación privada.
  }

  return Boolean(import.meta.env.DEV);
};

const sanitize = (value: unknown, depth = 0): unknown => {
  if (depth > 5) return "[MAX_DEPTH]";
  if (value === null || value === undefined) return value;
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack?.split("\n").slice(0, 8).join("\n"),
    };
  }
  if (value instanceof File) {
    return {
      name: value.name,
      type: value.type,
      size: value.size,
      lastModified: value.lastModified,
    };
  }
  if (value instanceof Blob) {
    return { type: value.type, size: value.size };
  }
  if (Array.isArray(value)) {
    return value.slice(0, 100).map((entry) => sanitize(entry, depth + 1));
  }
  if (typeof value === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      if (REDACTED_KEYS.has(key.toLowerCase())) {
        output[key] = "[REDACTED]";
      } else {
        output[key] = sanitize(entry, depth + 1);
      }
    }
    return output;
  }
  if (typeof value === "string" && value.length > 1000) {
    return `${value.slice(0, 1000)}…[TRUNCATED]`;
  }
  return value;
};

const write = (
  level: CatalogAiLogLevel,
  scope: string,
  event: string,
  context: CatalogAiLogContext = {},
): void => {
  if (!readDebugFlag() && (level === "debug" || level === "info")) return;

  const timestamp = new Date().toISOString();
  const prefix = `[CATALOG-AI][FRONT][${scope}][${event}]`;
  const payload = sanitize({ timestamp, ...context });
  const writer = console[level] ?? console.log;
  writer(prefix, payload);
};

export const catalogAiDebug = {
  enabled: readDebugFlag,
  createId(prefix = "trace"): string {
    const random = globalThis.crypto?.randomUUID?.()
      ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return `${prefix}-${random}`;
  },
  debug(scope: string, event: string, context?: CatalogAiLogContext): void {
    write("debug", scope, event, context);
  },
  info(scope: string, event: string, context?: CatalogAiLogContext): void {
    write("info", scope, event, context);
  },
  warn(scope: string, event: string, context?: CatalogAiLogContext): void {
    write("warn", scope, event, context);
  },
  error(scope: string, event: string, context?: CatalogAiLogContext): void {
    write("error", scope, event, context);
  },
  table(scope: string, event: string, rows: unknown[]): void {
    if (!readDebugFlag()) return;
    console.info(`[CATALOG-AI][FRONT][${scope}][${event}]`, {
      timestamp: new Date().toISOString(),
      rows: rows.length,
    });
    console.table(sanitize(rows));
  },
};