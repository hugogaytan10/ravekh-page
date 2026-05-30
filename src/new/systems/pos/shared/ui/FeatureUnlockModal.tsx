import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { emitPosBusinessUpdated } from "../config/posBusinessEvents";
import { getPosApiBaseUrl } from "../config/posEnv";
import { clearPendingPosUpgradeContext, readPendingPosUpgradeContext, readPosSessionSnapshot } from "../config/posSession";
import "./FeatureUnlockModal.css";

export type UnlockModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
  onUpgrade?: () => void;
};

type PlanKey = "INICIAL" | "BASICO" | "INTERMEDIO" | "EMPRESARIAL" | "VIP" | "EMPRENDEDOR";

type PlanConfig = {
  amount: number;
  plan: PlanKey;
};

type CheckoutStep = "intro" | "plans" | "payment" | "success" | "error";

type PaymentIntentResponse = {
  publishableKey?: string;
  clientSecret?: string;
  customer?: string;
  ephemeralKey?: string;
  paymentIntentId?: string;
  paymentId?: string | number;
  status?: string;
};

type StripeInstance = {
  elements: (options: { clientSecret: string }) => StripeElements;
  confirmPayment: (options: { elements: StripeElements; redirect: "if_required" }) => Promise<{ error?: { message?: string } }>;
};

type StripeElements = {
  create: (type: "payment") => { mount: (element: HTMLElement) => void; unmount?: () => void; destroy?: () => void };
};

declare global {
  interface Window {
    Stripe?: (publishableKey: string) => StripeInstance | null;
  }
}

const PLAN_CONFIG: Record<PlanKey, PlanConfig> = {
  INICIAL: { amount: 200, plan: "INICIAL" },
  BASICO: { amount: 300, plan: "BASICO" },
  INTERMEDIO: { amount: 700, plan: "INTERMEDIO" },
  EMPRESARIAL: { amount: 850, plan: "EMPRESARIAL" },
  VIP: { amount: 1050, plan: "VIP" },
  EMPRENDEDOR: { amount: 500, plan: "EMPRENDEDOR" },
};

const STRIPE_JS_SRC = "https://js.stripe.com/v3/";
const stripeScriptPromise: { current: Promise<void> | null } = { current: null };

const normalizePlanName = (plan: unknown): PlanKey | null => {
  const normalizedPlan = String(plan || "")
    .trim()
    .toUpperCase()
    .replace(/^PLAN\s+/, "");

  return normalizedPlan in PLAN_CONFIG ? (normalizedPlan as PlanKey) : null;
};

const UNLOCK_LOG_MESSAGES: Record<string, string> = {
  "stripe-js:already-loaded": "Stripe ya estaba cargado en la página.",
  "stripe-js:load-reuse": "Ya había una carga de Stripe en proceso, reutilizando esa carga.",
  "stripe-js:load-start": "Cargando Stripe.js para mostrar el formulario de pago.",
  "stripe-js:existing-script": "Encontré el script de Stripe en el DOM, esperando que termine de cargar.",
  "stripe-js:load-success": "Stripe.js cargó correctamente.",
  "stripe-js:load-error": "Stripe.js no pudo cargar.",
  "request:start": "Enviando petición al backend.",
  "request:complete": "El backend respondió la petición.",
  "payment-element:prepare": "Preparando el formulario de tarjeta de Stripe.",
  "stripe:init-success": "Stripe quedó inicializado con la llave pública del backend.",
  "payment-element:mounted": "El formulario de pago ya está visible para el usuario.",
  "payment-element:error": "No se pudo preparar el formulario de pago.",
  "payment-element:cleanup-error": "Stripe ya había limpiado el formulario de pago; se ignora el segundo intento.",
  "payment:create:start": "El usuario eligió un plan; creando pago en backend.",
  "payment:create:invalid-plan": "El plan seleccionado no existe en la configuración local.",
  "payment:create:missing-context": "No hay datos suficientes para crear el pago.",
  "payment:create:invalid-response": "El backend creó una respuesta incompleta para iniciar Stripe.",
  "payment:create:success": "Pago creado; ya tengo clientSecret y llave pública para Stripe.",
  "payment:create:error": "Falló la creación del pago.",
  "backend-confirm:start": "Confirmando PaymentIntent contra el backend.",
  "backend-confirm:fallback": "El endpoint principal no existe; intentando endpoint alternativo.",
  "business:update-plan:start": "Pago exitoso; actualizando plan del negocio en backend.",
  "business:update-plan:response": "El backend respondió la actualización de plan.",
  "business:update-plan:success": "Plan actualizado correctamente en backend y frontend.",
  "stripe-confirm:start": "El usuario confirmó el pago; enviando confirmación a Stripe.",
  "stripe-confirm:missing-context": "No hay sesión/negocio suficiente para confirmar el pago.",
  "stripe-confirm:stripe-error": "Stripe rechazó o no pudo confirmar el pago.",
  "stripe-confirm:stripe-success": "Stripe confirmó el pago sin error.",
  "backend-confirm:response": "Respuesta de confirmación final del backend.",
  "checkout:success": "Checkout terminado con éxito.",
  "checkout:error": "Checkout terminó con error.",
};

const describeUnlockLog = (event: string) => UNLOCK_LOG_MESSAGES[event] ?? event;

const logUnlockCheckout = (event: string, payload: Record<string, unknown> = {}) => {
  console.info(`Pago/desbloqueo: ${describeUnlockLog(event)}`, { paso: event, ...payload });
};

const warnUnlockCheckout = (event: string, payload: Record<string, unknown> = {}) => {
  console.warn(`Pago/desbloqueo: ${describeUnlockLog(event)}`, { paso: event, ...payload });
};

const errorUnlockCheckout = (event: string, payload: Record<string, unknown> = {}) => {
  console.error(`Pago/desbloqueo: ${describeUnlockLog(event)}`, { paso: event, ...payload });
};

const sanitizeForLog = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(sanitizeForLog);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => {
      const normalizedKey = key.toLowerCase();
      if (normalizedKey.includes("token") || normalizedKey.includes("secret") || normalizedKey.includes("key")) {
        return [key, entry ? "[presente]" : entry];
      }
      return [key, sanitizeForLog(entry)];
    }),
  );
};

const loadStripeScript = (): Promise<void> => {
  if (window.Stripe) {
    logUnlockCheckout("stripe-js:already-loaded");
    return Promise.resolve();
  }
  if (stripeScriptPromise.current) {
    logUnlockCheckout("stripe-js:load-reuse");
    return stripeScriptPromise.current;
  }

  logUnlockCheckout("stripe-js:load-start", { src: STRIPE_JS_SRC });
  stripeScriptPromise.current = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${STRIPE_JS_SRC}"]`);
    if (existingScript) {
      logUnlockCheckout("stripe-js:existing-script");
      existingScript.addEventListener("load", () => {
        logUnlockCheckout("stripe-js:load-success", { source: "existing" });
        resolve();
      }, { once: true });
      existingScript.addEventListener("error", () => {
        errorUnlockCheckout("stripe-js:load-error", { source: "existing" });
        reject(new Error("No fue posible cargar Stripe.js."));
      }, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = STRIPE_JS_SRC;
    script.async = true;
    script.onload = () => {
      logUnlockCheckout("stripe-js:load-success", { source: "created" });
      resolve();
    };
    script.onerror = () => {
      errorUnlockCheckout("stripe-js:load-error", { source: "created" });
      reject(new Error("No fue posible cargar Stripe.js."));
    };
    document.head.appendChild(script);
  });

  return stripeScriptPromise.current;
};

const getStoredObject = (key: string): Record<string, unknown> | null => {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
};

const resolveCheckoutContext = () => {
  const session = readPosSessionSnapshot();
  const pendingUpgrade = readPendingPosUpgradeContext();
  const storedUser = getStoredObject("user") ?? getStoredObject("User");
  const storedBusiness = getStoredObject("business") ?? getStoredObject("Business");
  const businessId = Number(pendingUpgrade?.businessId ?? storedUser?.Business_Id ?? storedUser?.businessId ?? storedBusiness?.Id ?? storedBusiness?.id ?? session.businessId);
  const token = String(pendingUpgrade?.token ?? storedUser?.Token ?? storedUser?.token ?? session.token ?? "").trim();

  const context = {
    businessId: Number.isFinite(businessId) ? businessId : 0,
    token,
    business: storedBusiness,
  };

  return context;
};

const getApiBaseUrl = () => getPosApiBaseUrl();

const postJson = async <T,>(path: string, payload: unknown, token: string): Promise<{ response: Response; data: T | null }> => {
  logUnlockCheckout("request:start", { path, payload: sanitizeForLog(payload), hasToken: Boolean(token) });
  const response = await fetch(new URL(path, getApiBaseUrl()).toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => null) as T | null;
  logUnlockCheckout("request:complete", {
    path,
    ok: response.ok,
    status: response.status,
    hasData: Boolean(data),
    paymentStatus: getPaymentStatus(data),
    backendResponse: sanitizeForLog(data),
  });
  return { response, data };
};

const getPaymentStatus = (value: unknown): string => {
  if (!value || typeof value !== "object") return "";
  const record = value as Record<string, unknown>;
  return String(record.status ?? record.Status ?? record.paymentStatus ?? record.PaymentStatus ?? "").toLowerCase();
};

const updateStoredBusinessPlan = (plan: PlanKey) => {
  for (const key of ["business", "Business"]) {
    const storedBusiness = getStoredObject(key);
    if (!storedBusiness) continue;
    window.localStorage.setItem(key, JSON.stringify({ ...storedBusiness, Plan: plan, plan }));
  }
};

export const FeatureUnlockModal = ({
  open,
  onClose,
  title = "Desbloquea esta función",
  message = "Esta función está bloqueada en tu plan actual. Desbloquéala contratando un plan para usarla sin límites.",
  buttonText = "Desbloquear ahora",
  onUpgrade,
}: UnlockModalProps) => {
  const [step, setStep] = useState<CheckoutStep>("intro");
  const [selectedPlan, setSelectedPlan] = useState<PlanConfig | null>(null);
  const [payment, setPayment] = useState<PaymentIntentResponse | null>(null);
  const [stripe, setStripe] = useState<StripeInstance | null>(null);
  const [elements, setElements] = useState<StripeElements | null>(null);
  const [paymentElement, setPaymentElement] = useState<{ unmount?: () => void; destroy?: () => void } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const paymentElementRef = useRef<HTMLDivElement | null>(null);

  const plans = useMemo(() => Object.values(PLAN_CONFIG), []);

  useEffect(() => {
    if (!open) {
      setStep("intro");
      setSelectedPlan(null);
      setPayment(null);
      setStripe(null);
      setElements(null);
      setPaymentElement(null);
      setLoading(false);
      setError("");
    }
  }, [open]);

  useEffect(() => {
    if (step !== "payment" || !payment?.publishableKey || !payment.clientSecret || !paymentElementRef.current) return;

    let cancelled = false;
    let mountedPaymentElement: { unmount?: () => void; destroy?: () => void } | null = null;
    logUnlockCheckout("payment-element:prepare", {
      plan: selectedPlan?.plan,
      hasPublishableKey: Boolean(payment.publishableKey),
      hasClientSecret: Boolean(payment.clientSecret),
    });
    setError("");
    loadStripeScript()
      .then(() => {
        if (cancelled) return;
        const stripeClient = window.Stripe?.(payment.publishableKey || "") ?? null;
        if (!stripeClient) throw new Error("No fue posible inicializar Stripe.");
        logUnlockCheckout("stripe:init-success", { plan: selectedPlan?.plan });
        const nextElements = stripeClient.elements({ clientSecret: payment.clientSecret || "" });
        const nextPaymentElement = nextElements.create("payment");
        mountedPaymentElement = nextPaymentElement;
        nextPaymentElement.mount(paymentElementRef.current as HTMLElement);
        setStripe(stripeClient);
        setElements(nextElements);
        setPaymentElement(nextPaymentElement);
        logUnlockCheckout("payment-element:mounted", { plan: selectedPlan?.plan });
      })
      .catch((cause) => {
        if (!cancelled) {
          errorUnlockCheckout("payment-element:error", { message: cause instanceof Error ? cause.message : String(cause) });
          setError(cause instanceof Error ? cause.message : "No fue posible preparar el formulario de pago.");
          setStep("error");
        }
      });

    return () => {
      cancelled = true;
      try {
        mountedPaymentElement?.destroy?.();
      } catch (cause) {
        warnUnlockCheckout("payment-element:cleanup-error", { message: cause instanceof Error ? cause.message : String(cause) });
      }
    };
  }, [payment?.clientSecret, payment?.publishableKey, step]);

  if (!open) return null;

  const startUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
      return;
    }

    setStep("plans");
  };

  const createPayment = async (plan: PlanConfig) => {
    logUnlockCheckout("payment:create:start", { selectedPlan: plan.plan, amount: plan.amount });
    const resolvedPlan = PLAN_CONFIG[normalizePlanName(plan.plan) || "VIP"];
    if (!resolvedPlan) {
      warnUnlockCheckout("payment:create:invalid-plan", { selectedPlan: plan.plan });
      setError("Selecciona un plan válido para continuar.");
      setStep("error");
      return;
    }

    const context = resolveCheckoutContext();
    if (!context.businessId || !context.token) {
      warnUnlockCheckout("payment:create:missing-context", { businessId: context.businessId, hasToken: Boolean(context.token) });
      setError("No encontramos una sesión activa del negocio para crear el pago.");
      setStep("error");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const startsAt = new Date().toISOString().slice(0, 10);
      const { response, data } = await postJson<PaymentIntentResponse>("createGeneralPayment", {
        businessId: context.businessId,
        kind: "PLAN",
        amount: resolvedPlan.amount,
        planName: resolvedPlan.plan,
        startsAt,
        durationDays: 30,
        currency: "MXN",
        notes: `Pago plan ${resolvedPlan.plan.toLowerCase()}`,
      }, context.token);

      if (!response.ok || !data?.publishableKey || !data.clientSecret) {
        warnUnlockCheckout("payment:create:invalid-response", {
          ok: response.ok,
          status: response.status,
          hasPublishableKey: Boolean(data?.publishableKey),
          hasClientSecret: Boolean(data?.clientSecret),
          hasPaymentIntentId: Boolean(data?.paymentIntentId),
          backendResponse: sanitizeForLog(data),
        });
        throw new Error("No fue posible crear el pago. Intenta de nuevo.");
      }

      logUnlockCheckout("payment:create:success", {
        plan: resolvedPlan.plan,
        amount: resolvedPlan.amount,
        status: data.status ?? null,
        hasPaymentIntentId: Boolean(data.paymentIntentId),
        hasPaymentId: Boolean(data.paymentId),
        backendResponse: sanitizeForLog(data),
      });
      setSelectedPlan(resolvedPlan);
      setPayment(data);
      setStep("payment");
    } catch (cause) {
      errorUnlockCheckout("payment:create:error", { message: cause instanceof Error ? cause.message : String(cause) });
      setError(cause instanceof Error ? cause.message : "No fue posible iniciar el checkout de Stripe.");
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  const confirmPaymentInBackend = async (paymentIntentId: string, token: string) => {
    const payload = { paymentIntentId };
    logUnlockCheckout("backend-confirm:start", { hasPaymentIntentId: Boolean(paymentIntentId) });
    const primary = await postJson<Record<string, unknown>>("confirmPaymentIntent", payload, token);
    if (primary.response.status !== 404) return primary;
    warnUnlockCheckout("backend-confirm:fallback", { from: "confirmPaymentIntent", to: "stripe/confirmPaymentIntent" });
    return postJson<Record<string, unknown>>("stripe/confirmPaymentIntent", payload, token);
  };

  const updateBusinessPlan = async (businessId: number, token: string, plan: PlanKey) => {
    logUnlockCheckout("business:update-plan:start", { businessId, plan });
    const response = await fetch(new URL("update-plan", getApiBaseUrl()).toString(), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        token,
      },
      body: JSON.stringify({ id: businessId, plan }),
    });
    const updatePlanResponse = await response.json().catch(() => null) as unknown;

    logUnlockCheckout("business:update-plan:response", { ok: response.ok, status: response.status, businessId, plan, backendResponse: sanitizeForLog(updatePlanResponse) });
    if (!response.ok) throw new Error("El pago fue exitoso, pero no se pudo actualizar el plan del negocio.");
    window.localStorage.setItem("plan", plan);
    updateStoredBusinessPlan(plan);
    clearPendingPosUpgradeContext();
    emitPosBusinessUpdated({ businessId, source: "plan-checkout" });
    logUnlockCheckout("business:update-plan:success", { businessId, plan });
  };

  const confirmStripePayment = async (event: FormEvent) => {
    event.preventDefault();
    logUnlockCheckout("stripe-confirm:start", {
      plan: selectedPlan?.plan ?? null,
      hasStripe: Boolean(stripe),
      hasElements: Boolean(elements),
      hasPaymentIntentId: Boolean(payment?.paymentIntentId),
    });
    if (!stripe || !elements || !selectedPlan || !payment?.paymentIntentId) {
      setError("El formulario de pago todavía no está listo.");
      return;
    }

    const context = resolveCheckoutContext();
    if (!context.businessId || !context.token) {
      warnUnlockCheckout("stripe-confirm:missing-context", { businessId: context.businessId, hasToken: Boolean(context.token) });
      setError("No encontramos una sesión activa del negocio para confirmar el pago.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await stripe.confirmPayment({ elements, redirect: "if_required" });
      if (result.error) {
        warnUnlockCheckout("stripe-confirm:stripe-error", { message: result.error.message ?? "unknown" });
        throw new Error(result.error.message || "Stripe no pudo confirmar el pago.");
      }
      logUnlockCheckout("stripe-confirm:stripe-success", { plan: selectedPlan.plan });

      const confirmation = await confirmPaymentInBackend(payment.paymentIntentId, context.token);
      const status = getPaymentStatus(confirmation.data);
      logUnlockCheckout("backend-confirm:response", { ok: confirmation.response.ok, statusCode: confirmation.response.status, paymentStatus: status, backendResponse: sanitizeForLog(confirmation.data) });
      if (!confirmation.response.ok || status !== "succeeded") {
        throw new Error("El pago no fue confirmado como exitoso por el servidor.");
      }

      await updateBusinessPlan(context.businessId, context.token, selectedPlan.plan);
      logUnlockCheckout("checkout:success", { businessId: context.businessId, plan: selectedPlan.plan });
      setStep("success");
    } catch (cause) {
      errorUnlockCheckout("checkout:error", { message: cause instanceof Error ? cause.message : String(cause) });
      setError(cause instanceof Error ? cause.message : "No fue posible completar el pago.");
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  const renderBody = () => {
    if (step === "plans") {
      return (
        <>
          <span className="pos-feature-unlock__badge">Selecciona un plan</span>
          <h3>Elige cómo desbloquear</h3>
          <p>Contrata un plan mensual y activa las funciones disponibles para tu negocio.</p>
          <div className="pos-feature-unlock__plans">
            {plans.map((plan) => (
              <button key={plan.plan} type="button" onClick={() => void createPayment(plan)} disabled={loading}>
                <strong>{plan.plan}</strong>
                <span>${plan.amount} MXN / mes</span>
              </button>
            ))}
          </div>
        </>
      );
    }

    if (step === "payment") {
      return (
        <>
          <span className="pos-feature-unlock__badge">Pago seguro</span>
          <h3>Checkout Stripe · {selectedPlan?.plan}</h3>
          <p>Completa el pago de ${selectedPlan?.amount} MXN para activar tu plan por 30 días.</p>
          <form className="pos-feature-unlock__payment" onSubmit={confirmStripePayment}>
            <div ref={paymentElementRef} className="pos-feature-unlock__payment-element" />
            {error ? <p className="pos-feature-unlock__error">{error}</p> : null}
            <button type="submit" disabled={loading || !stripe || !elements}>{loading ? "Confirmando..." : "Pagar y activar plan"}</button>
          </form>
        </>
      );
    }

    if (step === "success") {
      return (
        <>
          <span className="pos-feature-unlock__badge">Pago exitoso</span>
          <h3>Tu plan fue activado</h3>
          <p>El pago se confirmó correctamente y el plan {selectedPlan?.plan} ya quedó asignado a tu negocio.</p>
          <div className="pos-feature-unlock__actions pos-feature-unlock__actions--single">
            <button type="button" onClick={onClose}>Continuar</button>
          </div>
        </>
      );
    }

    if (step === "error") {
      return (
        <>
          <span className="pos-feature-unlock__badge">Revisa el pago</span>
          <h3>No pudimos completar el proceso</h3>
          <p className="pos-feature-unlock__error">{error || "Ocurrió un error inesperado. Intenta nuevamente."}</p>
          <div className="pos-feature-unlock__actions">
            <button type="button" className="is-secondary" onClick={() => setStep("plans")}>Elegir otro plan</button>
            <button type="button" onClick={startUpgrade}>{buttonText}</button>
          </div>
        </>
      );
    }

    return (
      <>
        <span className="pos-feature-unlock__badge">Función premium</span>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="pos-feature-unlock__actions">
          <button type="button" className="is-secondary" onClick={onClose}>Ahora no</button>
          <button type="button" onClick={startUpgrade}>{buttonText}</button>
        </div>
      </>
    );
  };

  return (
    <section className="pos-feature-unlock" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <article className="pos-feature-unlock__card" onClick={(event) => event.stopPropagation()}>
        {renderBody()}
      </article>
    </section>
  );
};
