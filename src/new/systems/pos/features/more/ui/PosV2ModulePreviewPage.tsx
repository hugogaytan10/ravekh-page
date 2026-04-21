import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiFileText, FiPrinter } from "react-icons/fi";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import { MoreModulePage } from "../pages/MoreModulePage";
import { MoreModuleService } from "../services/MoreModuleService";
import { MORE_MODULE_SECTIONS } from "../config/moreModules";
import { ModernSystemsFactory } from "../../../../../index";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { POS_V2_PATHS } from "../../../routing/PosV2Paths";
import { readPosSessionSnapshot } from "../../../shared/config/posSession";
import { emitPosBusinessUpdated } from "../../../shared/config/posBusinessEvents";
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
  const [exportRows, setExportRows] = useState<Array<{
    id: number;
    label: string;
    quantity: number;
    total: number;
    price: number;
    earnings: number;
    coinId: number | null;
    hasActivity: boolean;
  }>>([]);
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
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentError, setPaymentError] = useState("");
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
  const exportTotalQuantity = useMemo(() => exportRows.reduce((sum, row) => sum + row.quantity, 0), [exportRows]);
  const exportTotalAmount = useMemo(() => exportRows.reduce((sum, row) => sum + row.total, 0), [exportRows]);
  const exportAverageTicket = useMemo(() => (exportRows.length > 0 ? exportTotalAmount / exportRows.length : 0), [exportRows, exportTotalAmount]);
  const exportInactiveCount = useMemo(() => exportRows.filter((row) => !row.hasActivity).length, [exportRows]);

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
    loadBranding();
    loadStripeConnect();
    loadBusinessStatus();
  }, [factory, moduleId, businessIdInput, token, employeeIdInput, exportScope, exportPeriod]);

  const buildExportFileName = () => {
    const scopeLabel = exportScope === "products" ? "productos" : exportScope === "employees" ? "empleados" : "clientes";
    const periodLabel = exportPeriod === "today" ? "hoy" : exportPeriod === "month" ? "mes" : "anio";
    const stamp = new Date().toISOString().slice(0, 10);
    return `reporte-${scopeLabel}-${periodLabel}-${stamp}`;
  };

  const escapeCsvCell = (value: string | number) => {
    const text = String(value ?? "");
    if (text.includes(",") || text.includes("\"") || text.includes("\n")) {
      return `"${text.replace(/"/g, "\"\"")}"`;
    }
    return text;
  };

  const escapeHtml = (value: string | number | null | undefined) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#39;");

  const getExportHeaders = () => {
    if (exportScope === "products") {
      return ["ID", "Producto", "Cantidad", "Precio", "Total ventas", "Ganancia"];
    }

    if (exportScope === "employees") {
      return ["ID", "Empleado", "Órdenes", "Total ventas", "CoinId"];
    }

    return ["ID", "Cliente", "Órdenes", "Total ventas", "CoinId"];
  };

  const getExportRowsForScope = () => {
    if (exportScope === "products") {
      return exportRows.map((row) => [
        row.id,
        row.label,
        row.quantity,
        row.price.toFixed(2),
        row.total.toFixed(2),
        row.earnings.toFixed(2),
      ]);
    }

    return exportRows.map((row) => [
      row.id,
      row.label,
      row.quantity,
      row.total.toFixed(2),
      row.coinId ?? "N/A",
    ]);
  };

  const exportAsCsv = () => {
    setExportError("");
    const headers = getExportHeaders();
    const rows = getExportRowsForScope();
    const csvContent = [headers, ...rows].map((line) => line.map(escapeCsvCell).join(",")).join("\n");
    try {
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const objectUrl = URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = `${buildExportFileName()}.csv`;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setExportError("No fue posible generar el CSV. Intenta de nuevo.");
    }
  };

  const exportAsPdf = () => {
    const printWindow = window.open("", "_blank", "width=1024,height=720");
    if (!printWindow) {
      setExportError("No fue posible abrir la ventana de impresión. Revisa el bloqueador de ventanas.");
      return;
    }
    const headers = getExportHeaders();
    const rows = getExportRowsForScope();
    const rowsMarkup = exportRows
      .map((_, index) => {
        const row = rows[index];
        const cells = row.map((cell, cellIndex) => {
          const isNumeric = typeof cell === "number" || (typeof cell === "string" && /^-?\d+(\.\d+)?$/.test(cell));
          const align = isNumeric ? "right" : "left";
          const isCurrencyColumn = ["Precio", "Total ventas", "Ganancia"].includes(headers[cellIndex]);
          const value = isNumeric && isCurrencyColumn ? `$${escapeHtml(cell)}` : escapeHtml(cell);
          return `<td style="text-align:${align};">${value}</td>`;
        }).join("");
        return `<tr>${cells}</tr>`;
      })
      .join("");
    const html = `
      <html>
        <head>
          <title>${buildExportFileName()}</title>
          <style>
            body { font-family: Inter, Arial, sans-serif; padding: 24px; color: #0f172a; }
            h1 { margin: 0 0 8px; font-size: 22px; }
            p { margin: 0 0 4px; color: #334155; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px; font-size: 13px; }
            th { background: #f8fafc; text-align: left; }
            .summary { margin-top: 12px; display: grid; gap: 4px; }
          </style>
        </head>
        <body>
          <h1>Exportar reportes</h1>
          <p>Alcance: ${exportScope}</p>
          <p>Periodo: ${exportPeriod}</p>
          <div class="summary">
            <p>Filas: ${exportRows.length}</p>
            <p>Sin actividad: ${exportInactiveCount}</p>
            <p>Total cantidad: ${exportTotalQuantity}</p>
            <p>Total monto: $${exportTotalAmount.toFixed(2)}</p>
          </div>
          <table>
            <thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead>
            <tbody>${rowsMarkup || `<tr><td colspan="${headers.length}" style="text-align:center;">Sin datos para el filtro seleccionado.</td></tr>`}</tbody>
          </table>
          <script>
            window.addEventListener('load', function() {
              setTimeout(function() {
                window.print();
              }, 200);
            });
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
  };

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

  const toggleCardChargesEnabled = async (enabled: boolean) => {
    const businessId = Number(businessIdInput);
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
      emitPosBusinessUpdated({ businessId, source: "payment-methods" });
    } catch (cause) {
      setPaymentError(cause instanceof Error ? cause.message : "No fue posible actualizar método tarjeta.");
    }
  };

  const selectPaymentMethod = async (method: "cash" | "card") => {
    const businessId = Number(businessIdInput);
    setPaymentSaving(true);
    setPaymentError("");
    try {
      if (method === "cash") {
        await toggleCardChargesEnabled(false);
      } else {
        await toggleCardChargesEnabled(true);
      }
    } catch (cause) {
      setPaymentError(cause instanceof Error ? cause.message : "No fue posible actualizar selección de método.");
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
      setBusinessStatus((current) => (current ? {
        ...current,
        name: saved.name,
        phone: saved.phoneNumber,
        address: saved.address,
      } : current));
      emitPosBusinessUpdated({ businessId, source: "business-branding" });
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
        {moduleId !== "business" && data.warning ? <p className="pos-v2-module-preview__warning">⚠️ {data.warning}</p> : null}

        {moduleId === "business" ? (
          <section className="pos-v2-module-preview__beta">

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
            <p className="pos-v2-module-preview__subtitle">
              Filtra tu reporte y descárgalo directamente en CSV o PDF para compartirlo con contabilidad.
            </p>
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
            <div className="pos-v2-module-preview__summary-grid" aria-label="Resumen de exportación">
              <article>
                <small>Filas</small>
                <strong>{exportRows.length}</strong>
              </article>
              <article>
                <small>Cantidad total</small>
                <strong>{exportTotalQuantity}</strong>
              </article>
              <article>
                <small>Monto total</small>
                <strong>${exportTotalAmount.toFixed(2)}</strong>
              </article>
              <article>
                <small>Promedio por fila</small>
                <strong>${exportAverageTicket.toFixed(2)}</strong>
              </article>
              <article>
                <small>Sin actividad</small>
                <strong>{exportInactiveCount}</strong>
              </article>
            </div>
            <div className="pos-v2-module-preview__actions-inline">
              <button type="button" onClick={exportAsCsv} disabled={exportLoading || exportRows.length === 0}>
                <FiFileText aria-hidden="true" /> Exportar CSV
              </button>
              <button type="button" onClick={exportAsPdf} disabled={exportLoading}>
                <FiPrinter aria-hidden="true" /> Exportar PDF
              </button>
            </div>
            {exportLoading ? <div className="pos-v2-module-preview__skeleton" aria-hidden="true"><span /><span /><span /></div> : null}
            {exportError ? <p className="pos-v2-module-preview__error">{exportError}</p> : null}
            {!exportLoading && !exportError ? (
              <div className="pos-v2-module-preview__table">
                <p><strong>Filas:</strong> {exportRows.length}</p>
                {exportRows.length === 0 ? <p>No hay datos para el filtro seleccionado.</p> : null}
                {exportRows.slice(0, 10).map((row, index) => (
                  <article key={`${row.label}-${index}`} className="pos-v2-module-preview__row is-inline">
                    <strong>{row.label} </strong>
                    <small>
                      {exportScope === "products"
                        ? `Cantidad: ${row.quantity} · Precio: $${row.price.toFixed(2)} · Ventas: $${row.total.toFixed(2)} · Ganancia: $${row.earnings.toFixed(2)}`
                        : `Órdenes: ${row.quantity} · Ventas: $${row.total.toFixed(2)} · CoinId: ${row.coinId ?? "N/A"}`}
                    </small>
                    {exportScope === "products" ? <small>CoinId: {row.coinId ?? "N/A"} · {row.hasActivity ? "Con actividad" : "Sin actividad"}</small> : null}
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
          
            {paymentError ? <p className="pos-v2-module-preview__error">{paymentError}</p> : null}
            {businessStatus ? (
              <div className="pos-v2-module-preview__form">
                <div className="pos-v2-module-preview__table">
                  <article className="pos-v2-module-preview__row is-inline">
                    <strong>Método principal</strong>
                    <div className="pos-v2-module-preview__radio-group" role="radiogroup" aria-label="Seleccionar método principal">
                      <button
                        type="button"
                        className={businessStatus?.chargesEnabled ? "" : "is-selected"}
                        disabled={paymentSaving}
                        onClick={() => selectPaymentMethod("cash")}
                      >
                        Efectivo
                      </button>
                      <button
                        type="button"
                        className={businessStatus?.chargesEnabled ? "is-selected" : ""}
                        disabled={paymentSaving}
                        onClick={() => selectPaymentMethod("card")}
                      >
                        Tarjeta
                      </button>
                    </div>
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
