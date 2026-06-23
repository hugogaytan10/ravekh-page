import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { emitPosBusinessUpdated } from "../config/posBusinessEvents";
import { getPosApiBaseUrl } from "../config/posEnv";
import { clearPendingPosUpgradeContext, readPendingPosUpgradeContext, readPosSessionSnapshot } from "../config/posSession";
import "./FeatureUnlockModal.css";

export type UnlockFeature = "Pos" | "Catalog" | "Fidelity" | "DynamicQr";

export type UnlockModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
  onUpgrade?: () => void;
  onPaymentSuccess?: () => void;
  unlockFeature?: UnlockFeature;
};

type PlanKey = "INICIAL" | "BASICO" | "INTERMEDIO" | "EMPRESARIAL" | "VIP" | "EMPRENDEDOR";
type PlanFeature = "Catalog" | "Pos";

type PaymentSelection = {
  id: string;
  label: string;
  description: string;
  amount: number;
  kind: "PLAN" | "MODULES";
  plan?: PlanKey;
  moduleName?: "Fidelity";
  planFeatures?: PlanFeature[];
};

type PlanSelection = {
  amount: number;
  plan: PlanKey;
};

type CheckoutStep = "intro" | "plans" | "features" | "payment" | "success" | "error";

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

const PLAN_CONFIG: Record<PlanKey, PlanSelection> = {
  INICIAL: { amount: 200, plan: "INICIAL" },
  BASICO: { amount: 300, plan: "BASICO" },
  INTERMEDIO: { amount: 700, plan: "INTERMEDIO" },
  EMPRESARIAL: { amount: 850, plan: "EMPRESARIAL" },
  VIP: { amount: 1050, plan: "VIP" },
  EMPRENDEDOR: { amount: 500, plan: "EMPRENDEDOR" },
};

const MODULE_ADDON_AMOUNT = 50;

const PLAN_CHOICES: PlanSelection[] = [
  PLAN_CONFIG.INICIAL,
  PLAN_CONFIG.BASICO,
  PLAN_CONFIG.EMPRENDEDOR,
  PLAN_CONFIG.INTERMEDIO,
  PLAN_CONFIG.EMPRESARIAL,
  PLAN_CONFIG.VIP,
];

const STRIPE_JS_SRC = "https://js.stripe.com/v3/";
const stripeScriptPromise: { current: Promise<void> | null } = { current: null };

const normalizePlanName = (plan: unknown): PlanKey | null => {
  const normalizedPlan = String(plan || "")
    .trim()
    .toUpperCase()
    .replace(/^PLAN\s+/, "");

  return normalizedPlan in PLAN_CONFIG ? (normalizedPlan as PlanKey) : null;
};

const logUnlockCheckout = (_event: string, _payload: Record<string, unknown> = {}) => {
  void _event;
  void _payload;
};
const warnUnlockCheckout = (_event: string, _payload: Record<string, unknown> = {}) => {
  void _event;
  void _payload;
};
const errorUnlockCheckout = (_event: string, _payload: Record<string, unknown> = {}) => {
  void _event;
  void _payload;
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

const getCurrentPlan = (): PlanKey | null => {
  const storedBusiness = getStoredObject("business") ?? getStoredObject("Business");
  return normalizePlanName(window.localStorage.getItem("plan") ?? storedBusiness?.Plan ?? storedBusiness?.plan);
};

const isPaidCurrentPlan = (plan: PlanKey | null): plan is PlanKey => Boolean(plan && plan !== "INICIAL");

const getRequestedFeature = (unlockFeature?: UnlockFeature): UnlockFeature | null => unlockFeature ?? null;

const buildDirectPaymentSelections = (unlockFeature?: UnlockFeature): PaymentSelection[] => {
  const requestedFeature = getRequestedFeature(unlockFeature);
  if (requestedFeature === "Fidelity" || requestedFeature === "DynamicQr") {
    return [{
      id: requestedFeature === "Fidelity" ? "fidelity-module" : "dynamic-qr-module",
      label: requestedFeature === "Fidelity" ? "Fidelity" : "QR dinámico",
      description: requestedFeature === "Fidelity"
        ? "Activa cupones, visitas y fidelidad."
        : "Activa QR dinámico como feature extra de fidelidad.",
      amount: MODULE_ADDON_AMOUNT,
      kind: "MODULES",
      moduleName: "Fidelity",
    }];
  }

  const currentPlan = getCurrentPlan();
  if ((requestedFeature === "Catalog" || requestedFeature === "Pos") && isPaidCurrentPlan(currentPlan)) {
    return [{
      id: `${requestedFeature.toLowerCase()}-addon`,
      label: `Agregar ${requestedFeature === "Catalog" ? "Catálogo" : "POS"}`,
      description: `Desbloquea ${requestedFeature === "Catalog" ? "el catálogo" : "el POS"} en tu plan actual por $50 MXN.`,
      amount: MODULE_ADDON_AMOUNT,
      kind: "PLAN",
      plan: currentPlan,
      planFeatures: [requestedFeature],
    }];
  }

  return [];
};

const buildPlanFeatureSelections = (selectedPlan: PlanSelection): PaymentSelection[] => [
  {
    id: `${selectedPlan.plan.toLowerCase()}-catalog`,
    label: "Catálogo",
    description: `Contrata ${selectedPlan.plan} y activa solo catálogo.`,
    amount: selectedPlan.amount,
    kind: "PLAN",
    plan: selectedPlan.plan,
    planFeatures: ["Catalog"],
  },
  {
    id: `${selectedPlan.plan.toLowerCase()}-pos`,
    label: "POS",
    description: `Contrata ${selectedPlan.plan} y activa solo POS.`,
    amount: selectedPlan.amount,
    kind: "PLAN",
    plan: selectedPlan.plan,
    planFeatures: ["Pos"],
  },
  {
    id: `${selectedPlan.plan.toLowerCase()}-catalog-pos`,
    label: "Catálogo + POS",
    description: `Contrata ${selectedPlan.plan} con Catálogo y POS (+$50 MXN).`,
    amount: selectedPlan.amount + MODULE_ADDON_AMOUNT,
    kind: "PLAN",
    plan: selectedPlan.plan,
    planFeatures: ["Catalog", "Pos"],
  },
];

export const FeatureUnlockModal = ({
  open,
  onClose,
  title = "Desbloquea esta función",
  message = "Esta función está bloqueada en tu plan actual. Desbloquéala contratando un plan para usarla sin límites.",
  buttonText = "Desbloquear ahora",
  onUpgrade,
  onPaymentSuccess,
  unlockFeature,
}: UnlockModalProps) => {
  const [step, setStep] = useState<CheckoutStep>("intro");
  const [selectedSelection, setSelectedSelection] = useState<PaymentSelection | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanSelection | null>(null);
  const [payment, setPayment] = useState<PaymentIntentResponse | null>(null);
  const [stripe, setStripe] = useState<StripeInstance | null>(null);
  const [elements, setElements] = useState<StripeElements | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const paymentElementRef = useRef<HTMLDivElement | null>(null);

  const directPaymentSelections = useMemo(() => buildDirectPaymentSelections(unlockFeature), [unlockFeature, open]);
  const featureSelections = useMemo(() => selectedPlan ? buildPlanFeatureSelections(selectedPlan) : [], [selectedPlan]);

  useEffect(() => {
    if (!open) {
      setStep("intro");
      setSelectedSelection(null);
      setSelectedPlan(null);
      setPayment(null);
      setStripe(null);
      setElements(null);
      setLoading(false);
      setError("");
    }
  }, [open]);

  useEffect(() => {
    if (step !== "payment" || !payment?.publishableKey || !payment.clientSecret || !paymentElementRef.current) return;

    let cancelled = false;
    let mountedPaymentElement: { unmount?: () => void; destroy?: () => void } | null = null;
    logUnlockCheckout("payment-element:prepare", {
      selection: selectedSelection?.label,
      hasPublishableKey: Boolean(payment.publishableKey),
      hasClientSecret: Boolean(payment.clientSecret),
    });
    setError("");
    loadStripeScript()
      .then(() => {
        if (cancelled) return;
        const stripeClient = window.Stripe?.(payment.publishableKey || "") ?? null;
        if (!stripeClient) throw new Error("No fue posible inicializar Stripe.");
        logUnlockCheckout("stripe:init-success", { selection: selectedSelection?.label });
        const nextElements = stripeClient.elements({ clientSecret: payment.clientSecret || "" });
        const nextPaymentElement = nextElements.create("payment");
        mountedPaymentElement = nextPaymentElement;
        nextPaymentElement.mount(paymentElementRef.current as HTMLElement);
        setStripe(stripeClient);
        setElements(nextElements);
        logUnlockCheckout("payment-element:mounted", { selection: selectedSelection?.label });
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

  const selectPlan = (plan: PlanSelection) => {
    setSelectedPlan(plan);
    setError("");
    setStep("features");
  };

  const createPayment = async (selection: PaymentSelection) => {
    logUnlockCheckout("payment:create:start", {
      selected: selection.label,
      kind: selection.kind,
      amount: selection.amount,
      plan: selection.plan ?? null,
      moduleName: selection.moduleName ?? null,
      planFeatures: selection.planFeatures ?? null,
    });

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
      const payload = selection.kind === "MODULES"
        ? {
            businessId: context.businessId,
            kind: "MODULES",
            moduleName: selection.moduleName,
            amount: selection.amount,
            currency: "MXN",
          }
        : {
            businessId: context.businessId,
            kind: "PLAN",
            amount: selection.amount,
            planName: selection.plan,
            currency: "MXN",
            planFeatures: selection.planFeatures ?? [],
          };

      const { response, data } = await postJson<PaymentIntentResponse>("createGeneralPayment", payload, context.token);

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
        selected: selection.label,
        kind: selection.kind,
        amount: selection.amount,
        status: data.status ?? null,
        hasPaymentIntentId: Boolean(data.paymentIntentId),
        hasPaymentId: Boolean(data.paymentId),
        backendResponse: sanitizeForLog(data),
      });
      setSelectedSelection(selection);
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

  const confirmStripePayment = async (event: FormEvent) => {
    event.preventDefault();
    logUnlockCheckout("stripe-confirm:start", {
      selection: selectedSelection?.label ?? null,
      hasStripe: Boolean(stripe),
      hasElements: Boolean(elements),
      hasPaymentIntentId: Boolean(payment?.paymentIntentId),
    });
    if (!stripe || !elements || !selectedSelection || !payment?.paymentIntentId) {
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
      logUnlockCheckout("stripe-confirm:stripe-success", { selection: selectedSelection.label });

      const confirmation = await confirmPaymentInBackend(payment.paymentIntentId, context.token);
      const status = getPaymentStatus(confirmation.data);
      logUnlockCheckout("backend-confirm:response", { ok: confirmation.response.ok, statusCode: confirmation.response.status, paymentStatus: status, backendResponse: sanitizeForLog(confirmation.data) });
      if (!confirmation.response.ok || status !== "succeeded") {
        throw new Error("El pago no fue confirmado como exitoso por el servidor.");
      }

      clearPendingPosUpgradeContext();
      emitPosBusinessUpdated({ businessId: context.businessId, source: "payment-checkout" });
      logUnlockCheckout("checkout:success", { businessId: context.businessId, selection: selectedSelection.label, kind: selectedSelection.kind });
      setStep("success");
      onPaymentSuccess?.();
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
      if (directPaymentSelections.length > 0) {
        return (
          <>
            <span className="pos-feature-unlock__badge">Selecciona qué desbloquear</span>
            <h3>Elige la función</h3>
            <p>Esta función se desbloquea como extra independiente por $50 MXN.</p>
            <div className="pos-feature-unlock__plans">
              {directPaymentSelections.map((selection) => (
                <button key={selection.id} type="button" onClick={() => void createPayment(selection)} disabled={loading}>
                  <strong>{selection.label}</strong>
                  <small>{selection.description}</small>
                  <span>${selection.amount} MXN</span>
                </button>
              ))}
            </div>
          </>
        );
      }

      return (
        <>
          <span className="pos-feature-unlock__badge">Selecciona un plan</span>
          <h3>Elige el plan</h3>
          <p>Primero selecciona el plan que quieres contratar. Después eliges si agregas Catálogo, POS o ambos.</p>
          <div className="pos-feature-unlock__plans">
            {PLAN_CHOICES.map((plan) => (
              <button key={plan.plan} type="button" onClick={() => selectPlan(plan)} disabled={loading}>
                <strong>{plan.plan}</strong>
                <small>Plan mensual base</small>
                <span>${plan.amount} MXN</span>
              </button>
            ))}
          </div>
        </>
      );
    }

    if (step === "features") {
      return (
        <>
          <span className="pos-feature-unlock__badge">Selecciona funciones</span>
          <h3>¿Qué quieres activar con {selectedPlan?.plan}?</h3>
          <p>Catálogo o POS mantienen el precio del plan. Si eliges ambos, se agrega $50 MXN extra.</p>
          <div className="pos-feature-unlock__plans">
            {featureSelections.map((selection) => (
              <button key={selection.id} type="button" onClick={() => void createPayment(selection)} disabled={loading}>
                <strong>{selection.label}</strong>
                <small>{selection.description}</small>
                <span>${selection.amount} MXN</span>
              </button>
            ))}
          </div>
          <div className="pos-feature-unlock__actions pos-feature-unlock__actions--single">
            <button type="button" className="is-secondary" onClick={() => setStep("plans")}>Cambiar plan</button>
          </div>
        </>
      );
    }

    if (step === "payment") {
      return (
        <>
          <span className="pos-feature-unlock__badge">Pago seguro</span>
          <h3>Checkout Stripe · {selectedSelection?.label}</h3>
          <p>Completa el pago de ${selectedSelection?.amount} MXN para activar {selectedSelection?.label}.</p>
          <form className="pos-feature-unlock__payment" onSubmit={confirmStripePayment} autoComplete="off">
            <div ref={paymentElementRef} className="pos-feature-unlock__payment-element" />
            {error ? <p className="pos-feature-unlock__error">{error}</p> : null}
            <button type="submit" disabled={loading || !stripe || !elements}>{loading ? "Confirmando..." : "Pagar y activar"}</button>
          </form>
        </>
      );
    }

    if (step === "success") {
      return (
        <>
          <span className="pos-feature-unlock__badge">Pago exitoso</span>
          <h3>Tu compra fue activada</h3>
          <p>El pago se confirmó correctamente. El backend activará el plan o módulo comprado.</p>
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
