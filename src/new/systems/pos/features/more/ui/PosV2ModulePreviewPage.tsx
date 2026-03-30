import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import { MoreModulePage } from "../pages/MoreModulePage";
import { MoreModuleService } from "../services/MoreModuleService";
import { MORE_MODULE_SECTIONS } from "../config/moreModules";
import { ModernSystemsFactory } from "../../../../../index";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { POS_V2_PATHS } from "../../../routing/PosV2Paths";
import { readPosSessionSnapshot } from "../../../shared/config/posSession";
import "./PosV2ModulePreviewPage.css";

const API_BASE_URL = getPosApiBaseUrl();

type PreviewData = {
  title: string;
  description: string;
  eta: string;
  warning?: string;
};

const PREVIEW_MODULES: Record<string, PreviewData> = {
  support: {
    title: "Ayuda",
    description: "Punto central para documentación y soporte in-app.",
    eta: "Sprint soporte v2",
  },
  "delete-account": {
    title: "Borrar cuenta",
    description: "Flujo sensible en diseño para cumplir UX y validaciones de seguridad.",
    eta: "Sprint seguridad v2",
    warning: "Esta acción puede ser irreversible. Asegura respaldo y autorización antes de continuar.",
  },
  "cash-closing": {
    title: "Corte de caja",
    description: "Preparado para validar cierres diarios sin depender de interfaces anteriores.",
    eta: "Sprint cierre de caja v2",
    warning: "Verifica montos por método de pago y turno activo antes de confirmar el cierre.",
  },
  printers: {
    title: "Impresoras",
    description: "Beta de diagnóstico para validar conectividad y salud de dispositivos.",
    eta: "Beta de dispositivos habilitada",
    warning: "Antes de producción valida pruebas de impresión por cada estación.",
  },
  business: {
    title: "Información del negocio",
    description: "Consulta y actualización de datos fiscales/comerciales en la capa moderna.",
    eta: "Sprint configuración v2",
    warning: "Los cambios impactan facturación y catálogos públicos; valida antes de guardar.",
  },
  "payment-methods": {
    title: "Métodos de pago",
    description: "Configura qué métodos estarán disponibles para cobrar en POS v2.",
    eta: "Disponible en POS moderno",
  },
  "stripe-connect": {
    title: "Stripe Connect",
    description: "Conecta y administra tu cuenta de Stripe para recibir cobros.",
    eta: "Disponible en POS moderno",
  },
};

export const PosV2ModulePreviewPage = () => {
  const { moduleId = "" } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [betaResponse, setBetaResponse] = useState("");
  const [betaError, setBetaError] = useState("");
  const [taxLoading, setTaxLoading] = useState(false);
  const [taxSaving, setTaxSaving] = useState(false);
  const [taxError, setTaxError] = useState("");
  const [taxSuccess, setTaxSuccess] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState("");
  const [exportRows, setExportRows] = useState<Array<{ label: string; quantity: number; total: number }>>([]);
  const [exportScope, setExportScope] = useState<"products" | "employees" | "customers">("products");
  const [exportPeriod, setExportPeriod] = useState<"today" | "month" | "year">("month");
  const [cashClosingLoading, setCashClosingLoading] = useState(false);
  const [cashClosingError, setCashClosingError] = useState("");
  const [cashClosingInfo, setCashClosingInfo] = useState<{
    id: number;
    employeeId: number;
    expectedAmount: number;
    countedAmount: number;
    difference: number;
    balanced: boolean;
  } | null>(null);
  const [taxForm, setTaxForm] = useState({
    enabled: false,
    description: "",
    value: "0",
    isPercent: true,
    canBeRemovedAtSale: false,
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSettings, setPaymentSettings] = useState<{
    globallyEnabled: boolean;
    options: Array<{ type: "cash" | "card" | "online"; label: string; enabled: boolean; locked: boolean }>;
  } | null>(null);
  const [businessStatus, setBusinessStatus] = useState<{
    name: string;
    plan: string;
    phone: string;
    address: string;
    chargesEnabled: boolean;
  } | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeSaving, setStripeSaving] = useState(false);
  const [stripeError, setStripeError] = useState("");
  const [stripeSuccess, setStripeSuccess] = useState("");
  const [stripeConfig, setStripeConfig] = useState<{ enabled?: boolean; publishableKey?: string; accountId?: string | null } | null>(null);
  const [stripeAccountId, setStripeAccountId] = useState<string>("");
  const [brandingLoading, setBrandingLoading] = useState(false);
  const [brandingSaving, setBrandingSaving] = useState(false);
  const [brandingSuccess, setBrandingSuccess] = useState("");
  const [brandingError, setBrandingError] = useState("");
  const [brandingForm, setBrandingForm] = useState({
    name: "",
    address: "",
    phoneNumber: "",
    logo: "",
    color: "#6D01D1",
    references: "",
  });

  const session = useMemo(() => readPosSessionSnapshot(), []);
  const token = session.token;
  const businessIdInput = String(session.businessId || "");
  const employeeIdInput = String(session.employeeId || "");

  const data = useMemo<PreviewData>(() => {
    if (PREVIEW_MODULES[moduleId]) return PREVIEW_MODULES[moduleId];

    const allModules = MORE_MODULE_SECTIONS.flatMap((section) => section.items);
    const match = allModules.find((item) => item.id === moduleId);

    return {
      title: match?.title ?? "Módulo en preparación",
      description: match?.description ?? "Este acceso fue reservado para validar la navegación integral del POS v2.",
      eta: match?.status === "beta" ? "Disponible para pruebas beta" : "Planificación abierta",
    };
  }, [moduleId]);

  const modulePage = useMemo(() => new MoreModulePage(new MoreModuleService(API_BASE_URL)), []);
  const factory = useMemo(() => new ModernSystemsFactory(API_BASE_URL), []);

  const runBetaAction = async () => {
    setLoading(true);
    setBetaError("");
    setBetaResponse("");

    try {
      const result = await modulePage.execute(moduleId, data.title, {
        token: token.trim(),
        businessId: Number(businessIdInput),
        employeeId: Number(employeeIdInput),
      });
      setBetaResponse(JSON.stringify(result.payload, null, 2));
    } catch (cause) {
      setBetaError(cause instanceof Error ? cause.message : "No fue posible ejecutar la función beta.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const businessId = Number(businessIdInput);
    if (!token.trim() || !Number.isFinite(businessId) || businessId <= 0) return;

    const loadTax = async () => {
      if (moduleId !== "sales-tax") return;
      setTaxLoading(true);
      setTaxError("");
      try {
        const taxSettings = await factory.createPosSalesTaxPage().getSalesTaxSettings(businessId, token);
        setTaxForm({
          enabled: taxSettings.enabled,
          description: taxSettings.description || "IVA",
          value: String(taxSettings.value ?? 0),
          isPercent: taxSettings.isPercent,
          canBeRemovedAtSale: taxSettings.canBeRemovedAtSale,
        });
      } catch (cause) {
        setTaxError(cause instanceof Error ? cause.message : "No fue posible cargar impuestos.");
      } finally {
        setTaxLoading(false);
      }
    };

    const loadExportPreview = async () => {
      if (moduleId !== "exports") return;
      setExportLoading(true);
      setExportError("");
      try {
        const report = await factory.createPosExportReportPage().load(businessId, exportScope, exportPeriod, token);
        setExportRows(report);
      } catch (cause) {
        setExportError(cause instanceof Error ? cause.message : "No fue posible cargar el reporte.");
      } finally {
        setExportLoading(false);
      }
    };

    const loadCashClosing = async () => {
      if (moduleId !== "cash-closing") return;
      const employeeId = Number(employeeIdInput);
      if (!Number.isFinite(employeeId) || employeeId <= 0) {
        setCashClosingInfo(null);
        setCashClosingError("No encontramos employee id activo para consultar corte de caja.");
        return;
      }
      setCashClosingLoading(true);
      setCashClosingError("");
      try {
        const closing = await factory.createPosCashClosingPage().loadCurrent(employeeId, token);
        setCashClosingInfo(closing);
      } catch (cause) {
        setCashClosingError(cause instanceof Error ? cause.message : "No fue posible cargar el corte de caja.");
      } finally {
        setCashClosingLoading(false);
      }
    };

    const loadPaymentMethods = async () => {
      if (moduleId !== "payment-methods") return;
      setPaymentLoading(true);
      setPaymentError("");
      try {
        const vm = await factory.createPosPaymentMethodPage().getViewModel(businessId, token);
        setPaymentSettings({
          globallyEnabled: vm.globallyEnabled,
          options: vm.options.map((option) => ({
            type: option.type,
            label: option.label,
            enabled: option.enabled,
            locked: option.locked,
          })),
        });
      } catch (cause) {
        setPaymentError(cause instanceof Error ? cause.message : "No fue posible cargar métodos de pago.");
      } finally {
        setPaymentLoading(false);
      }
    };

    const loadBranding = async () => {
      if (moduleId !== "business") return;
      setBrandingLoading(true);
      try {
        const profile = await factory.createPosBrandingPage().loadProfile(businessId, token);
        setBrandingForm({
          name: profile.name,
          address: profile.address,
          phoneNumber: profile.phoneNumber,
          logo: profile.logo,
          color: profile.color || "#6D01D1",
          references: profile.references,
        });
      } catch {
        setBrandingSuccess("");
      } finally {
        setBrandingLoading(false);
      }
    };

    const loadStripeConnect = async () => {
      if (moduleId !== "stripe-connect") return;
      setStripeLoading(true);
      setStripeError("");
      setStripeSuccess("");
      try {
        const config = await factory.createPosStripeConnectPage().getConfig(token);
        const configAccountId = typeof config.accountId === "string" ? config.accountId : "";
        setStripeConfig({
          enabled: typeof config.enabled === "boolean" ? config.enabled : undefined,
          publishableKey: typeof config.publishableKey === "string" ? config.publishableKey : undefined,
          accountId: configAccountId || null,
        });
        setStripeAccountId(configAccountId);
      } catch (cause) {
        setStripeError(cause instanceof Error ? cause.message : "No fue posible cargar configuración de Stripe.");
      } finally {
        setStripeLoading(false);
      }
    };

    const loadBusinessStatus = async () => {
      if (!["payment-methods", "business", "stripe-connect"].includes(moduleId)) return;
      try {
        const response = await fetch(new URL(`business/${businessId}`, API_BASE_URL).toString(), {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) return;
        const payload = await response.json() as Record<string, unknown>;
        setBusinessStatus({
          name: String(payload.Name ?? payload.name ?? `Negocio #${businessId}`),
          plan: String(payload.Plan ?? payload.plan ?? "No definido"),
          phone: String(payload.PhoneNumber ?? payload.phoneNumber ?? "No disponible"),
          address: String(payload.Address ?? payload.address ?? "No disponible"),
          chargesEnabled: Number(payload.ChargesEnabled ?? payload.chargesEnabled ?? 0) === 1,
        });
      } catch {
        setBusinessStatus(null);
      }
    };

    loadTax();
    loadExportPreview();
    loadCashClosing();
    loadPaymentMethods();
    loadBranding();
    loadStripeConnect();
    loadBusinessStatus();
  }, [factory, moduleId, businessIdInput, token, employeeIdInput, exportScope, exportPeriod]);

  const saveTax = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const businessId = Number(businessIdInput);
    setTaxSaving(true);
    setTaxError("");
    setTaxSuccess("");

    try {
      if (!taxForm.enabled) {
        await factory.createPosSalesTaxPage().disableSalesTax(businessId, token);
      } else {
        await factory.createPosSalesTaxPage().saveSalesTax(token, {
          businessId,
          description: taxForm.description,
          value: Number(taxForm.value),
          isPercent: taxForm.isPercent,
          canBeRemovedAtSale: taxForm.canBeRemovedAtSale,
        });
      }
      setTaxSuccess("Impuestos guardados correctamente.");
    } catch (cause) {
      setTaxError(cause instanceof Error ? cause.message : "No se pudo guardar la configuración de impuesto.");
    } finally {
      setTaxSaving(false);
    }
  };

  const togglePaymentGlobal = async (enabled: boolean) => {
    const businessId = Number(businessIdInput);
    setPaymentSaving(true);
    setPaymentError("");
    try {
      const vm = await factory.createPosPaymentMethodPage().toggleGlobal(businessId, enabled, token);
      setPaymentSettings({
        globallyEnabled: vm.globallyEnabled,
        options: vm.options.map((option) => ({
          type: option.type,
          label: option.label,
          enabled: option.enabled,
          locked: option.locked,
        })),
      });
    } catch (cause) {
      setPaymentError(cause instanceof Error ? cause.message : "No fue posible actualizar configuración global.");
    } finally {
      setPaymentSaving(false);
    }
  };

  const togglePaymentMethod = async (type: "cash" | "card" | "online", enabled: boolean) => {
    const businessId = Number(businessIdInput);
    setPaymentSaving(true);
    setPaymentError("");
    try {
      const vm = await factory.createPosPaymentMethodPage().toggleMethod(businessId, type, enabled, token);
      setPaymentSettings({
        globallyEnabled: vm.globallyEnabled,
        options: vm.options.map((option) => ({
          type: option.type,
          label: option.label,
          enabled: option.enabled,
          locked: option.locked,
        })),
      });
    } catch (cause) {
      setPaymentError(cause instanceof Error ? cause.message : "No fue posible actualizar método.");
    } finally {
      setPaymentSaving(false);
    }
  };

  const toggleCardChargesEnabled = async (enabled: boolean) => {
    const businessId = Number(businessIdInput);
    setPaymentSaving(true);
    setPaymentError("");
    try {
      const response = await fetch(new URL(`business/${businessId}`, API_BASE_URL).toString(), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ChargesEnabled: enabled ? 1 : 0 }),
      });
      if (!response.ok) throw new Error("No fue posible actualizar estado de tarjeta.");
      setBusinessStatus((current) => (current ? { ...current, chargesEnabled: enabled } : current));
    } catch (cause) {
      setPaymentError(cause instanceof Error ? cause.message : "No fue posible actualizar método tarjeta.");
    } finally {
      setPaymentSaving(false);
    }
  };

  const saveBranding = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const businessId = Number(businessIdInput);
    setBrandingSaving(true);
    setBrandingSuccess("");
    setBrandingError("");
    try {
      const saved = await factory.createPosBrandingPage().saveProfile(businessId, brandingForm, token);
      setBrandingForm({
        name: saved.name,
        address: saved.address,
        phoneNumber: saved.phoneNumber,
        logo: saved.logo,
        color: saved.color,
        references: saved.references,
      });
      setBrandingSuccess("Branding guardado correctamente.");
    } catch (cause) {
      setBrandingSuccess("");
      setBrandingError(cause instanceof Error ? cause.message : "No fue posible guardar la información del negocio.");
    } finally {
      setBrandingSaving(false);
    }
  };

  const onBrandingImageSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setBrandingError("Selecciona un archivo de imagen válido.");
      return;
    }

    const encoded = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
      reader.onerror = () => reject(new Error("No fue posible procesar la imagen."));
      reader.readAsDataURL(file);
    }).catch(() => "");

    if (!encoded) {
      setBrandingError("No fue posible cargar la imagen.");
      return;
    }

    setBrandingError("");
    setBrandingForm((current) => ({ ...current, logo: encoded }));
  };

  const createStripeAccount = async () => {
    const businessId = Number(businessIdInput);
    setStripeSaving(true);
    setStripeError("");
    setStripeSuccess("");
    try {
      const account = await factory.createPosStripeConnectPage().ensureConnectedAccount(businessId, token);
      setStripeAccountId(account.connectedAccountId);
      setStripeConfig((current) => ({
        enabled: current?.enabled,
        publishableKey: current?.publishableKey,
        accountId: account.connectedAccountId,
      }));
      setStripeSuccess("Cuenta de Stripe Connect creada correctamente.");
    } catch (cause) {
      setStripeError(cause instanceof Error ? cause.message : "No fue posible crear la cuenta conectada.");
    } finally {
      setStripeSaving(false);
    }
  };

  const createStripeLink = async (type: "account_onboarding" | "account_update") => {
    const businessId = Number(businessIdInput);
    const connectedAccountId = stripeAccountId.trim() || (stripeConfig?.accountId ?? "").trim();
    if (!connectedAccountId) {
      setStripeError("Primero crea o captura un connectedAccountId.");
      return;
    }

    const fallbackPath = POS_V2_PATHS.morePreview("stripe-connect");
    const defaultUrl = typeof window !== "undefined" ? `${window.location.origin}${fallbackPath}` : fallbackPath;

    setStripeSaving(true);
    setStripeError("");
    setStripeSuccess("");
    try {
      const link = await factory.createPosStripeConnectPage().buildOnboardingLink(
        {
          connectedAccountId,
          businessId,
          type,
          refreshUrl: defaultUrl,
          returnUrl: defaultUrl,
        },
        token,
      );
      setStripeAccountId(connectedAccountId);
      if (typeof window !== "undefined" && link.url) {
        window.open(link.url, "_blank", "noopener,noreferrer");
      }
      setStripeSuccess(type === "account_update" ? "Link de actualización generado." : "Link de onboarding generado.");
    } catch (cause) {
      setStripeError(cause instanceof Error ? cause.message : "No fue posible generar el link de Stripe.");
    } finally {
      setStripeSaving(false);
    }
  };

  return (
    <PosV2Shell title={data.title} subtitle="Vista previa de módulo POS v2">
      <section className="pos-v2-module-preview">
        <h2>{data.title}</h2>
        {moduleId !== "business" ? <p>{data.description}</p> : null}
        {moduleId !== "business" ? <p className="pos-v2-module-preview__eta">Entrega estimada: {data.eta}</p> : null}
        {moduleId !== "business" && data.warning ? <p className="pos-v2-module-preview__warning">⚠️ {data.warning}</p> : null}

        {modulePage.supportsInlineExecution(moduleId) && !["payment-methods", "business", "stripe-connect"].includes(moduleId) ? (
          <section className="pos-v2-module-preview__beta">
            <h3>Funciones beta disponibles</h3>
            <p>Ejecuta una lectura real del módulo para validar funcionalidad.</p>
            <button type="button" onClick={runBetaAction} disabled={loading}>
              {loading ? "Ejecutando..." : "Probar función beta"}
            </button>
            {betaError ? <p className="pos-v2-module-preview__error">{betaError}</p> : null}
            {betaResponse ? <pre>{betaResponse}</pre> : null}
          </section>
        ) : null}

        {moduleId === "business" ? (
          <section className="pos-v2-module-preview__beta">
            <h3>Datos del negocio</h3>
            {businessStatus ? (
              <article className="pos-v2-module-preview__business-card">
                <p><strong>{businessStatus.name}</strong></p>
                <p>Plan: {businessStatus.plan}</p>
                <p>Teléfono: {businessStatus.phone}</p>
                <p>Dirección: {businessStatus.address}</p>
                <p>Tarjeta: <span className={businessStatus.chargesEnabled ? "is-on" : "is-off"}>{businessStatus.chargesEnabled ? "Activa (ChargesEnabled=1)" : "Inactiva (ChargesEnabled=0)"}</span></p>
              </article>
            ) : null}
            <form className="pos-v2-module-preview__form" onSubmit={saveBranding}>
              {brandingLoading ? <div className="pos-v2-module-preview__skeleton" aria-hidden="true"><span /><span /></div> : null}
              <div className="pos-v2-module-preview__inputs">
                <label className="pos-v2-module-preview__floating-field">
                  <input
                    value={brandingForm.name}
                    onChange={(event) => setBrandingForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder=" "
                    autoComplete="organization"
                  />
                  <span>Nombre comercial</span>
                </label>
                <label className="pos-v2-module-preview__floating-field">
                  <input
                    value={brandingForm.phoneNumber}
                    onChange={(event) => setBrandingForm((current) => ({ ...current, phoneNumber: event.target.value }))}
                    placeholder=" "
                    type="tel"
                    autoComplete="tel"
                  />
                  <span>Teléfono</span>
                </label>
              </div>
              <div className="pos-v2-module-preview__inputs">
                <label className="pos-v2-module-preview__floating-field">
                  <input
                    value={brandingForm.address}
                    onChange={(event) => setBrandingForm((current) => ({ ...current, address: event.target.value }))}
                    placeholder=" "
                    autoComplete="street-address"
                  />
                  <span>Dirección</span>
                </label>
                <label className="pos-v2-module-preview__color-field">
                  <span>Logo del negocio</span>
                  <div className="pos-v2-module-preview__logo-upload">
                    <input type="file" accept="image/*" onChange={onBrandingImageSelected} />
                  </div>
                </label>
              </div>
              <div className="pos-v2-module-preview__logo-preview">
                {brandingForm.logo ? <img src={brandingForm.logo} alt="Logo del negocio" /> : <p>Sin imagen de negocio. Sube un archivo para visualizarlo aquí.</p>}
              </div>
              <div className="pos-v2-module-preview__inputs">
                <label className="pos-v2-module-preview__floating-field">
                  <input
                    value={brandingForm.references}
                    onChange={(event) => setBrandingForm((current) => ({ ...current, references: event.target.value }))}
                    placeholder=" "
                  />
                  <span>Referencias</span>
                </label>
                <label className="pos-v2-module-preview__color-field">
                  <span>Color principal de la app</span>
                  <div>
                    <input type="color" value={brandingForm.color} onChange={(event) => setBrandingForm((current) => ({ ...current, color: event.target.value }))} aria-label="Color principal" />
                    <strong>{brandingForm.color.toUpperCase()}</strong>
                  </div>
                </label>
              </div>
              {brandingSuccess ? <p className="pos-v2-module-preview__ok">{brandingSuccess}</p> : null}
              {brandingError ? <p className="pos-v2-module-preview__error">{brandingError}</p> : null}
              <button type="submit" disabled={brandingSaving}>{brandingSaving ? "Guardando..." : "Guardar información del negocio"}</button>
            </form>
          </section>
        ) : null}

        {moduleId === "sales-tax" ? (
          <section className="pos-v2-module-preview__beta">
            <h3>Impuesto de venta</h3>
            {taxLoading ? <div className="pos-v2-module-preview__skeleton" aria-hidden="true"><span /><span /><span /></div> : null}
            {!taxLoading ? (
              <form className="pos-v2-module-preview__form" onSubmit={saveTax}>
                <label className="pos-v2-module-preview__switch">
                  <span>Impuesto habilitado</span>
                  <span className="pos-v2-module-preview__toggle">
                    <input type="checkbox" checked={taxForm.enabled} onChange={(event) => setTaxForm((current) => ({ ...current, enabled: event.target.checked }))} />
                    <span className="pos-v2-module-preview__toggle-slider" aria-hidden="true" />
                  </span>
                </label>
                <div className="pos-v2-module-preview__inputs">
                  <label className="pos-v2-module-preview__floating-field">
                    <input value={taxForm.description} onChange={(event) => setTaxForm((current) => ({ ...current, description: event.target.value }))} placeholder=" " disabled={!taxForm.enabled} />
                    <span>Descripción</span>
                  </label>
                  <label className="pos-v2-module-preview__floating-field">
                    <input type="number" min="0" step="0.01" value={taxForm.value} onChange={(event) => setTaxForm((current) => ({ ...current, value: event.target.value }))} placeholder=" " disabled={!taxForm.enabled} />
                    <span>Valor</span>
                  </label>
                </div>
                <label className="pos-v2-module-preview__switch">
                  <span>Aplicar como porcentaje</span>
                  <span className="pos-v2-module-preview__toggle">
                    <input type="checkbox" checked={taxForm.isPercent} onChange={(event) => setTaxForm((current) => ({ ...current, isPercent: event.target.checked }))} disabled={!taxForm.enabled} />
                    <span className="pos-v2-module-preview__toggle-slider" aria-hidden="true" />
                  </span>
                </label>
                <label className="pos-v2-module-preview__switch">
                  <span>Permitir quitar en venta</span>
                  <span className="pos-v2-module-preview__toggle">
                    <input type="checkbox" checked={taxForm.canBeRemovedAtSale} onChange={(event) => setTaxForm((current) => ({ ...current, canBeRemovedAtSale: event.target.checked }))} disabled={!taxForm.enabled} />
                    <span className="pos-v2-module-preview__toggle-slider" aria-hidden="true" />
                  </span>
                </label>
                {taxError ? <p className="pos-v2-module-preview__error">{taxError}</p> : null}
                {taxSuccess ? <p className="pos-v2-module-preview__ok">{taxSuccess}</p> : null}
                <button type="submit" disabled={taxSaving}>{taxSaving ? "Guardando..." : "Guardar cambios"}</button>
              </form>
            ) : null}
          </section>
        ) : null}

        {moduleId === "exports" ? (
          <section className="pos-v2-module-preview__beta">
            <h3>Exportar reportes</h3>
            <div className="pos-v2-module-preview__inputs">
              <select value={exportScope} onChange={(event) => setExportScope(event.target.value as "products" | "employees" | "customers")}>
                <option value="products">Productos</option>
                <option value="employees">Empleados</option>
                <option value="customers">Clientes</option>
              </select>
              <select value={exportPeriod} onChange={(event) => setExportPeriod(event.target.value as "today" | "month" | "year")}>
                <option value="today">Hoy</option>
                <option value="month">Mes</option>
                <option value="year">Año</option>
              </select>
            </div>
            {exportLoading ? <div className="pos-v2-module-preview__skeleton" aria-hidden="true"><span /><span /><span /></div> : null}
            {exportError ? <p className="pos-v2-module-preview__error">{exportError}</p> : null}
            {!exportLoading && !exportError ? (
              <div className="pos-v2-module-preview__table">
                <p><strong>Filas:</strong> {exportRows.length}</p>
                {exportRows.length === 0 ? <p>No hay datos para el filtro seleccionado.</p> : null}
                {exportRows.slice(0, 10).map((row, index) => (
                  <article key={`${row.label}-${index}`} className="pos-v2-module-preview__row is-inline">
                    <strong>{row.label}</strong>
                    <small>Cant: {row.quantity} · Total: ${row.total.toFixed(2)}</small>
                  </article>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        {moduleId === "cash-closing" ? (
          <section className="pos-v2-module-preview__beta">
            <h3>Corte de caja actual</h3>
            {cashClosingLoading ? <div className="pos-v2-module-preview__skeleton" aria-hidden="true"><span /><span /><span /></div> : null}
            {cashClosingError ? <p className="pos-v2-module-preview__error">{cashClosingError}</p> : null}
            {!cashClosingLoading && !cashClosingError && cashClosingInfo ? (
              <div className="pos-v2-module-preview__kv">
                <p><strong>ID corte:</strong> {cashClosingInfo.id}</p>
                <p><strong>Esperado:</strong> ${cashClosingInfo.expectedAmount.toFixed(2)}</p>
                <p><strong>Contado:</strong> ${cashClosingInfo.countedAmount.toFixed(2)}</p>
                <p><strong>Diferencia:</strong> ${cashClosingInfo.difference.toFixed(2)}</p>
                <p><strong>Balanceado:</strong> {cashClosingInfo.balanced ? "Sí" : "No"}</p>
              </div>
            ) : null}
            {!cashClosingLoading && !cashClosingError && !cashClosingInfo ? <p>No hay corte de caja activo para este usuario.</p> : null}
          </section>
        ) : null}

        {moduleId === "payment-methods" ? (
          <section className="pos-v2-module-preview__beta">
            <h3>Métodos de pago</h3>
            <p className="pos-v2-module-preview__hint">
              Se administra solo <strong>Efectivo</strong> y <strong>Tarjeta</strong>. Tarjeta usa el campo <strong>ChargesEnabled</strong> del negocio.
            </p>
            {paymentLoading ? <div className="pos-v2-module-preview__skeleton" aria-hidden="true"><span /><span /><span /></div> : null}
            {paymentError ? <p className="pos-v2-module-preview__error">{paymentError}</p> : null}
            {!paymentLoading && paymentSettings ? (
              <div className="pos-v2-module-preview__form">
                <label className="pos-v2-module-preview__switch">
                  <input
                    type="checkbox"
                    checked={paymentSettings.globallyEnabled}
                    onChange={(event) => togglePaymentGlobal(event.target.checked)}
                    disabled={paymentSaving}
                  />
                  <span>Habilitar cobros en POS</span>
                </label>
                <div className="pos-v2-module-preview__table">
                  {paymentSettings.options.filter((option) => option.type === "cash").map((option) => (
                    <article key={option.type} className="pos-v2-module-preview__row is-inline">
                      <strong>Efectivo</strong>
                      <label className="pos-v2-module-preview__switch">
                        <input
                          type="checkbox"
                          checked={option.enabled}
                          disabled={paymentSaving || option.locked}
                          onChange={(event) => togglePaymentMethod(option.type, event.target.checked)}
                        />
                        <span>{option.locked ? "Bloqueado por configuración global" : option.enabled ? "Activo" : "Inactivo"}</span>
                      </label>
                    </article>
                  ))}
                  <article className="pos-v2-module-preview__row is-inline">
                    <strong>Tarjeta (Stripe)</strong>
                    <label className="pos-v2-module-preview__switch">
                      <input
                        type="checkbox"
                        checked={Boolean(businessStatus?.chargesEnabled)}
                        disabled={paymentSaving || !paymentSettings.globallyEnabled}
                        onChange={(event) => toggleCardChargesEnabled(event.target.checked)}
                      />
                      <span>{businessStatus?.chargesEnabled ? "Activo · ya puede usar Stripe Connect" : "Inactivo · actívalo para usar Stripe Connect"}</span>
                    </label>
                  </article>
                </div>
                <button type="button" onClick={() => navigate(POS_V2_PATHS.morePreview("stripe-connect"))} disabled={!businessStatus?.chargesEnabled}>
                  {businessStatus?.chargesEnabled ? "Ir a Stripe Connect" : "Activa tarjeta para continuar con Stripe"}
                </button>
              </div>
            ) : null}
          </section>
        ) : null}

        {moduleId === "stripe-connect" ? (
          <section className="pos-v2-module-preview__beta">
            <h3>Stripe Connect</h3>
            {stripeLoading ? <div className="pos-v2-module-preview__skeleton" aria-hidden="true"><span /><span /><span /></div> : null}
            {stripeError ? <p className="pos-v2-module-preview__error">{stripeError}</p> : null}
            {stripeSuccess ? <p className="pos-v2-module-preview__ok">{stripeSuccess}</p> : null}
            {!stripeLoading ? (
              <div className="pos-v2-module-preview__form">
                <div className="pos-v2-module-preview__kv">
                  <p><strong>Habilitado:</strong> {stripeConfig?.enabled ? "Sí" : "No"}</p>
                  <p><strong>Publishable key:</strong> {stripeConfig?.publishableKey ? "Configurada" : "No configurada"}</p>
                  <p><strong>Tarjeta (ChargesEnabled):</strong> {businessStatus?.chargesEnabled ? "Activa" : "Inactiva"}</p>
                </div>
                <label className="pos-v2-module-preview__floating-field">
                  <input
                    value={stripeAccountId}
                    onChange={(event) => setStripeAccountId(event.target.value)}
                    placeholder=" "
                  />
                  <span>Connected Account ID</span>
                </label>
                <div className="pos-v2-module-preview__actions-inline">
                  <button type="button" onClick={createStripeAccount} disabled={stripeSaving}>
                    {stripeSaving ? "Procesando..." : "Crear cuenta conectada"}
                  </button>
                  <button type="button" onClick={() => createStripeLink("account_onboarding")} disabled={stripeSaving || !businessStatus?.chargesEnabled}>
                    Generar onboarding
                  </button>
                  <button type="button" onClick={() => createStripeLink("account_update")} disabled={stripeSaving || !businessStatus?.chargesEnabled}>
                    Actualizar cuenta
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        <div className="pos-v2-module-preview__actions">
          <button type="button" onClick={() => navigate(-1)}>← Volver atrás</button>
          <button type="button" onClick={() => navigate(POS_V2_PATHS.more)}>Ir a Más</button>
        </div>
      </section>
    </PosV2Shell>
  );
};
