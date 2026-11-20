import {authenticatedFetch as fetch} from '../../../../core/api/sessionFetch';
import { FormEvent, useEffect, useRef, useState } from "react";
import { emitPosBusinessUpdated } from "../config/posBusinessEvents";
import { hasRequiredPlan, type PosPlan } from "../config/posPlanAccess";
import { getPosApiBaseUrl } from "../config/posEnv";
import { clearPendingPosUpgradeContext, readPendingPosUpgradeContext, readPosSessionSnapshot } from "../config/posSession";
import "./FeatureUnlockModal.css";

export type UnlockFeature = "Pos" | "Catalog" | "Fidelity" | "DynamicQr";
export type UnlockPlanKey = "ESSENTIAL" | "START" | "PRO";

export const OFFICIAL_MONTHLY_PRICES: Record<UnlockPlanKey, number> = {
  ESSENTIAL: 89,
  START: 199,
  PRO: 399,
};

export type UnlockModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
  onUpgrade?: () => void;
  onPaymentSuccess?: () => void;
  unlockFeature?: UnlockFeature;
  minimumPlan?: PosPlan;
  catalogAiPacks?: boolean;
  cfdiPacks?: {units: number; amount: number}[];
  initialPlan?: {
    amount: number;
    plan: UnlockPlanKey;
    label?: string;
  };
};

type PlanKey = UnlockPlanKey;
type PlanFeature = "Catalog" | "Pos";

type PaymentSelection = {
  id: string;
  label: string;
  description: string;
  amount: number;
  kind: "PLAN" | "MODULES";
  batches?: number;
  cfdiUnits?: number;
  plan?: PlanKey;
  planFeatures?: PlanFeature[];
};

type PlanSelection = {
  amount: number;
  plan: PlanKey;
};

type CheckoutStep = "review" | "plans" | "payment" | "success" | "error";

type PaymentIntentResponse = {
  publishableKey?: string;
  clientSecret?: string;
  customer?: string;
  ephemeralKey?: string;
  paymentIntentId?: string;
  amountCents?: number;
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

const PLAN_CHOICES: PlanSelection[] = (Object.keys(OFFICIAL_MONTHLY_PRICES) as PlanKey[])
  .map(plan => ({ plan, amount: OFFICIAL_MONTHLY_PRICES[plan] }));

const STRIPE_JS_SRC = "https://js.stripe.com/v3/";
const stripeScriptPromise: { current: Promise<void> | null } = { current: null };

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

const getPlanDisplayName = (plan: PlanKey): string => {
  const labels: Record<PlanKey, string> = {
    ESSENTIAL: "Essential",
    START: "Start",
    PRO: "Pro",
  };

  return labels[plan];
};

const buildPlanPaymentSelection = (selectedPlan: PlanSelection, label?: string): PaymentSelection => ({
  id: selectedPlan.plan.toLowerCase(),
  label: label ?? getPlanDisplayName(selectedPlan.plan),
  description: `Plan ${label ?? getPlanDisplayName(selectedPlan.plan)}.`,
  amount: selectedPlan.amount,
  kind: "PLAN",
  plan: selectedPlan.plan,
  planFeatures: ["Catalog", "Pos"],
});

export const FeatureUnlockModal = ({
  open,
  onClose,
  title = "Desbloquea esta función",
  message = "Esta función está bloqueada en tu plan actual. Desbloquéala contratando un plan para usarla sin límites.",
  buttonText = "Desbloquear ahora",
  onUpgrade,
  onPaymentSuccess,
  unlockFeature,
  catalogAiPacks = false,
  cfdiPacks,
  minimumPlan = unlockFeature === "Fidelity" || unlockFeature === "DynamicQr" ? "START" : "ESSENTIAL",
  initialPlan,
}: UnlockModalProps) => {
  const [addonOptions,setAddonOptions]=useState<{code:string;capability:string;label:string;amount:number}[]>([]);
  const [chosenAddons,setChosenAddons]=useState<{code:string;quantity:number}[]>([]);
  const [step, setStep] = useState<CheckoutStep>(initialPlan ? "payment" : "plans");
  const [selectedSelection, setSelectedSelection] = useState<PaymentSelection | null>(null);
  const [payment, setPayment] = useState<PaymentIntentResponse | null>(null);
  const [stripe, setStripe] = useState<StripeInstance | null>(null);
  const [elements, setElements] = useState<StripeElements | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const paymentElementRef = useRef<HTMLDivElement | null>(null);
  const autoCheckoutKeyRef = useRef("");

  useEffect(() => {
    if (!open) {
      setStep(initialPlan ? "payment" : "plans");
      setSelectedSelection(null);
      setPayment(null);
      setStripe(null);
      setElements(null);
      setLoading(false);
      setError("");
      autoCheckoutKeyRef.current = "";
    }
  }, [initialPlan, open]);


  useEffect(() => {
    if (!open || !initialPlan) return;

    const checkoutKey = `${initialPlan.plan}-${initialPlan.amount}-${initialPlan.label ?? ""}`;
    if (autoCheckoutKeyRef.current === checkoutKey) return;

    autoCheckoutKeyRef.current = checkoutKey;
    setStep("payment");
    void createPayment(buildPlanPaymentSelection(initialPlan, initialPlan.label));
  }, [initialPlan, open]);

  useEffect(()=>{
    if(!open||initialPlan||catalogAiPacks||cfdiPacks||autoCheckoutKeyRef.current)return;
    const context=resolveCheckoutContext();
    if(!context.token)return;
    let active=true;
    void fetch(new URL('stripe/pos/addons/recurring',getApiBaseUrl()).toString(),{headers:{Authorization:`Bearer ${context.token}`}})
      .then(async response=>{if(!response.ok)return;const summary=await response.json();const previous=summary.previousPlan as PlanKey;if(active&&!autoCheckoutKeyRef.current&&OFFICIAL_MONTHLY_PRICES[previous]&&hasRequiredPlan(previous,minimumPlan)){autoCheckoutKeyRef.current='previous-selection';await createPayment(buildPlanPaymentSelection({plan:previous,amount:OFFICIAL_MONTHLY_PRICES[previous]}));}})
      .catch(()=>{});
    return ()=>{active=false;};
  },[open,initialPlan,catalogAiPacks,cfdiPacks,minimumPlan]);

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
    autoCheckoutKeyRef.current='user-selection';
    setError("");
    void createPayment(buildPlanPaymentSelection(plan));
  };

  async function createPayment(selection: PaymentSelection, confirmed=false) {
    logUnlockCheckout("payment:create:start", {
      selected: selection.label,
      kind: selection.kind,
      amount: selection.amount,
      plan: selection.plan ?? null,
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
      if(selection.kind==='PLAN'&&!confirmed) {
        const response=await fetch(new URL('stripe/pos/addons/recurring?plan='+selection.plan,getApiBaseUrl()).toString(),{headers:{Authorization:`Bearer ${context.token}`}});
        if(!response.ok)throw new Error('No se pudo recuperar tu selección anterior. Intenta otra vez.');
        const summary=await response.json();
        setAddonOptions(summary.offers||[]);
        const previous=summary.previousAddons??(summary.manualGrants||[]).flatMap((grant:{code:string;units:number})=>grant.code==='POS_EXTRA_BRANCHES'?[{code:'BRANCH_1',quantity:grant.units||1}]:grant.code==='POS_EXTRA_EMPLOYEES'?[{code:'EMPLOYEES_'+(grant.units<=1?1:grant.units<=3?3:10),quantity:1}]:grant.code==='POS_DAILY_ALERTS'?[{code:'DAILY_ALERTS',quantity:1}]:[]);
        setChosenAddons(previous.filter((item:{code:string})=>summary.offers.some((offer:{code:string})=>offer.code===item.code)));
        setSelectedSelection(selection);
        setStep('review');
        return;
      }
      const payload = {
        prepaidAddons:chosenAddons,
        businessId: context.businessId,
        kind: "PLAN",
        amount: selection.amount,
        planName: selection.plan,
        currency: "MXN",
        durationDays: 30,
        notes: "official-monthly",
        planFeatures: selection.planFeatures ?? [],
      };

      const { response, data } = selection.cfdiUnits !== undefined
        ? await postJson<PaymentIntentResponse>("stripe/pos/addons/cfdi", {units: selection.cfdiUnits}, context.token)
        : selection.batches === undefined
        ? await postJson<PaymentIntentResponse>("createGeneralPayment", payload, context.token)
        : await postJson<PaymentIntentResponse>("stripe/pos/addons/catalog-ai", { batches: selection.batches }, context.token);

      if (response.ok && (selection.kind==='PLAN'||selection.cfdiUnits !== undefined) && data?.amountCents !== Math.round(selection.amount * 100)) {
        throw new Error("El importe del bloque cambió. Actualiza la página antes de volver a intentarlo.");
      }
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
  }

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
    const currentStep = step;

    if(currentStep==='review'&&selectedSelection) {
      const extras=chosenAddons.reduce((sum,item)=>sum+(addonOptions.find(offer=>offer.code===item.code)?.amount||0)*item.quantity,0);
      const total=OFFICIAL_MONTHLY_PRICES[selectedSelection.plan!]+extras/100;
      return <>
        <h3>Revisa tu plan y complementos</h3>
        <p>Plan {getPlanDisplayName(selectedSelection.plan!)} · ${OFFICIAL_MONTHLY_PRICES[selectedSelection.plan!].toFixed(2)} MXN por un mes desde el pago.</p>
        <p>Puedes conservar, quitar o agregar complementos antes de pagar.</p>
        <div className="pos-feature-unlock__addons">
          {addonOptions.map(offer => {
            const selected = chosenAddons.find(item => item.code === offer.code);
            return <div className={`pos-feature-unlock__addon${selected ? ' is-selected' : ''}`} key={offer.code}>
              <label className="pos-feature-unlock__addon-choice">
                <input type="checkbox" checked={Boolean(selected)} onChange={() => setChosenAddons(current => selected ? current.filter(item => item.code !== offer.code) : [...current.filter(item => addonOptions.find(candidate => candidate.code === item.code)?.capability !== offer.capability), {code: offer.code, quantity: 1}])}/>
                <span><strong>{offer.label}</strong><span className="pos-feature-unlock__addon-price">${(offer.amount / 100).toFixed(2)} MXN / mes{offer.code === 'BRANCH_1' ? ' por sucursal' : ''}</span></span>
              </label>
              {selected && offer.code === 'BRANCH_1' && <label className="pos-feature-unlock__addon-quantity">Cantidad de sucursales
                <input type="number" min={1} max={100} value={selected.quantity} onChange={event => {const quantity = Number(event.target.value); if (Number.isInteger(quantity) && quantity >= 1 && quantity <= 100) setChosenAddons(current => current.map(item => item.code === offer.code ? {...item, quantity} : item));}}/>
              </label>}
            </div>;
          })}
        </div>
        <div className="pos-feature-unlock__total" aria-live="polite" aria-atomic="true">
          <span>Pago por 1 mes</span><strong>${total.toFixed(2)} <small>MXN</small></strong>
        </div>
        <p>Sin cobros automáticos. Al vencer vuelves a Gratuito y puedes renovar cuando quieras.</p>
        <p className="pos-feature-unlock__note">Eliminar empleados o sucursales no reembolsa el periodo ya pagado. Las activaciones de administración conservan su vigencia.</p>
        <div className="pos-feature-unlock__actions">
          <button type="button" className="is-secondary" disabled={loading} onClick={() => setStep('plans')}>Elegir otro plan</button>
          <button type="button" disabled={loading} onClick={() => void createPayment({...selectedSelection, amount: total}, true)}>Continuar al pago</button>
        </div>
      </>;
    }
    if (currentStep === "plans" && cfdiPacks) {
      return (
        <>
          <h3>Comprar bloques de CFDI</h3>
          <div className="pos-feature-unlock__plans">
            {cfdiPacks.map(pack => (
              <button key={pack.units} type="button" disabled={loading} onClick={() => void createPayment({
                id: `cfdi-${pack.units}`, label: `${pack.units} CFDI`, description: "Bloque de CFDI",
                amount: pack.amount / 100, kind: "MODULES", cfdiUnits: pack.units,
              })}>
                <strong>{pack.units} CFDI</strong>
                <span>{(pack.amount / 100).toLocaleString("es-MX", {style: "currency", currency: "MXN"})} MXN</span>
              </button>
            ))}
          </div>
        </>
      );
    }
    if (currentStep === "plans" && catalogAiPacks) {
      return (
        <>
          <h3>Comprar lotes adicionales de IA</h3>
          <p>Cada lote agrega 50 productos a tu saldo del mes actual.</p>
          <div className="pos-feature-unlock__plans">
            {[[1, 59], [2, 99], [5, 149]].map(([batches, amount]) => {
              const label = batches === 1 ? "1 lote de IA" : `${batches} lotes de IA`;
              return (
                <button key={batches} type="button" disabled={loading} onClick={() => void createPayment({
                  id: `catalog-ai-${batches}`, label, description: label, amount, kind: "MODULES", batches,
                })}>
                  <strong>{label}</strong>
                  <span>${amount} MXN</span>
                </button>
              );
            })}
          </div>
        </>
      );
    }
    if (currentStep === "plans") {
      return (
        <>
          <span className="pos-feature-unlock__badge">Selecciona un plan</span>
          <h3>Elige el plan</h3>
          <p>Selecciona un plan mensual.</p>
          <div className="pos-feature-unlock__plans">
            {PLAN_CHOICES.filter(plan => hasRequiredPlan(plan.plan, minimumPlan)).map((plan) => (
              <button key={plan.plan} type="button" onClick={() => selectPlan(plan)} disabled={loading}>
                <strong>{getPlanDisplayName(plan.plan)}</strong>
                <small>Plan mensual</small>
                <span>${plan.amount} MXN</span>
              </button>
            ))}
          </div>
        </>
      );
    }

    if (currentStep === "payment") {
      const isPreparingCheckout = !payment?.clientSecret || !selectedSelection;

      return (
        <>
          <span className="pos-feature-unlock__badge">Pago seguro</span>
          <h3>Checkout Stripe · {selectedSelection?.label ?? initialPlan?.label ?? "plan seleccionado"}</h3>
          <p>Completa el pago de ${selectedSelection?.amount ?? initialPlan?.amount ?? 0} MXN para activar {selectedSelection?.label ?? initialPlan?.label ?? "tu plan"}.</p>
          {isPreparingCheckout ? <p>Preparando checkout de Stripe...</p> : null}
          <form className="pos-feature-unlock__payment" onSubmit={confirmStripePayment} autoComplete="off">
            <div ref={paymentElementRef} className="pos-feature-unlock__payment-element" />
            {error ? <p className="pos-feature-unlock__error">{error}</p> : null}
            <button type="submit" disabled={loading || !stripe || !elements || isPreparingCheckout}>{loading ? "Confirmando..." : "Pagar y activar"}</button>
          </form>
        </>
      );
    }

    if (currentStep === "success") {
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

    if (currentStep === "error") {
      return (
        <>
          <span className="pos-feature-unlock__badge">Revisa el pago</span>
          <h3>No pudimos completar el proceso</h3>
          <p className="pos-feature-unlock__error">{error || "Ocurrió un error inesperado. Intenta nuevamente."}</p>
          <div className="pos-feature-unlock__actions">
            <button type="button" className="is-secondary" onClick={() => setStep("plans")}>{catalogAiPacks || cfdiPacks ? "Volver a paquetes" : "Elegir otro plan"}</button>
            <button type="button" onClick={startUpgrade}>{buttonText}</button>
          </div>
        </>
      );
    }

return null;
  };

  return (
    <section className="pos-feature-unlock" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <article className={`pos-feature-unlock__card${step === 'review' ? ' pos-feature-unlock__card--review' : ''}`} onClick={(event) => event.stopPropagation()}>
        {renderBody()}
      </article>
    </section>
  );
};
