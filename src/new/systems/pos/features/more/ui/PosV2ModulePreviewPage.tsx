import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import { MoreModulePage } from "../pages/MoreModulePage";
import { MoreModuleService } from "../services/MoreModuleService";
import { MORE_MODULE_SECTIONS } from "../config/moreModules";
import { ModernSystemsFactory } from "../../../../../index";
import "./PosV2ModulePreviewPage.css";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://apipos.ravekh.com/api/";

type PreviewData = {
  title: string;
  description: string;
  eta: string;
  warning?: string;
};

const PREVIEW_MODULES: Record<string, PreviewData> = {
  "catalog-settings": {
    title: "Configuración catálogo",
    description: "Aquí vivirá la configuración del catálogo online y sincronización de inventario en una capa independiente del legacy.",
    eta: "Sprint de catálogo v2",
  },
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
    description: "Preparado para validar cierres diarios sin depender del UI legacy.",
    eta: "Sprint cierre de caja v2",
    warning: "Verifica montos por método de pago y turno activo antes de confirmar el cierre.",
  },
  business: {
    title: "Información del negocio",
    description: "Consulta y actualización de datos fiscales/comerciales en la capa moderna.",
    eta: "Sprint configuración v2",
    warning: "Los cambios impactan facturación y catálogos públicos; valida antes de guardar.",
  },
};

export const PosV2ModulePreviewPage = () => {
  const { moduleId = "" } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [betaResponse, setBetaResponse] = useState("");
  const [betaError, setBetaError] = useState("");
  const [businessLoading, setBusinessLoading] = useState(false);
  const [businessError, setBusinessError] = useState("");
  const [businessInfo, setBusinessInfo] = useState<{ businessName: string; taxId: number | null; tablesEnabled: boolean } | null>(null);
  const [taxLoading, setTaxLoading] = useState(false);
  const [taxSaving, setTaxSaving] = useState(false);
  const [taxError, setTaxError] = useState("");
  const [taxSuccess, setTaxSuccess] = useState("");
  const [taxForm, setTaxForm] = useState({
    enabled: false,
    description: "",
    value: "0",
    isPercent: true,
    canBeRemovedAtSale: false,
  });

  const token = useMemo(() => window.localStorage.getItem("pos-v2-token") ?? "", []);
  const businessIdInput = useMemo(() => window.localStorage.getItem("pos-v2-business-id") ?? "", []);
  const employeeIdInput = useMemo(() => window.localStorage.getItem("pos-v2-employee-id") ?? "", []);

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

    const loadBusiness = async () => {
      if (moduleId !== "business") return;
      setBusinessLoading(true);
      setBusinessError("");
      try {
        const settings = await factory.createPosBusinessSettingsPage().load(businessId, token);
        setBusinessInfo(settings);
      } catch (cause) {
        setBusinessError(cause instanceof Error ? cause.message : "No fue posible cargar la información del negocio.");
      } finally {
        setBusinessLoading(false);
      }
    };

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

    loadBusiness();
    loadTax();
  }, [factory, moduleId, businessIdInput, token]);

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

  return (
    <PosV2Shell title={data.title} subtitle="Vista previa de módulo POS v2">
      <section className="pos-v2-module-preview">
        <h2>{data.title}</h2>
        <p>{data.description}</p>
        <p className="pos-v2-module-preview__eta">Entrega estimada: {data.eta}</p>
        {data.warning ? <p className="pos-v2-module-preview__warning">⚠️ {data.warning}</p> : null}

        {modulePage.supportsInlineExecution(moduleId) ? (
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
            <h3>Información del negocio</h3>
            {businessLoading ? <div className="pos-v2-module-preview__skeleton" aria-hidden="true"><span /><span /><span /></div> : null}
            {businessError ? <p className="pos-v2-module-preview__error">{businessError}</p> : null}
            {businessInfo ? (
              <div className="pos-v2-module-preview__kv">
                <p><strong>Nombre:</strong> {businessInfo.businessName}</p>
                <p><strong>ID de impuesto:</strong> {businessInfo.taxId ?? "Sin asignar"}</p>
                <p><strong>Mesas habilitadas:</strong> {businessInfo.tablesEnabled ? "Sí" : "No"}</p>
              </div>
            ) : null}
          </section>
        ) : null}

        {moduleId === "sales-tax" ? (
          <section className="pos-v2-module-preview__beta">
            <h3>Impuesto de venta</h3>
            {taxLoading ? <div className="pos-v2-module-preview__skeleton" aria-hidden="true"><span /><span /><span /></div> : null}
            {!taxLoading ? (
              <form className="pos-v2-module-preview__form" onSubmit={saveTax}>
                <label className="pos-v2-module-preview__switch">
                  <input type="checkbox" checked={taxForm.enabled} onChange={(event) => setTaxForm((current) => ({ ...current, enabled: event.target.checked }))} />
                  <span>Impuesto habilitado</span>
                </label>
                <div className="pos-v2-module-preview__inputs">
                  <input value={taxForm.description} onChange={(event) => setTaxForm((current) => ({ ...current, description: event.target.value }))} placeholder="Descripción" disabled={!taxForm.enabled} />
                  <input type="number" min="0" step="0.01" value={taxForm.value} onChange={(event) => setTaxForm((current) => ({ ...current, value: event.target.value }))} placeholder="Valor" disabled={!taxForm.enabled} />
                </div>
                <label className="pos-v2-module-preview__switch">
                  <input type="checkbox" checked={taxForm.isPercent} onChange={(event) => setTaxForm((current) => ({ ...current, isPercent: event.target.checked }))} disabled={!taxForm.enabled} />
                  <span>Aplicar como porcentaje</span>
                </label>
                <label className="pos-v2-module-preview__switch">
                  <input type="checkbox" checked={taxForm.canBeRemovedAtSale} onChange={(event) => setTaxForm((current) => ({ ...current, canBeRemovedAtSale: event.target.checked }))} disabled={!taxForm.enabled} />
                  <span>Permitir quitar en venta</span>
                </label>
                {taxError ? <p className="pos-v2-module-preview__error">{taxError}</p> : null}
                {taxSuccess ? <p className="pos-v2-module-preview__ok">{taxSuccess}</p> : null}
                <button type="submit" disabled={taxSaving}>{taxSaving ? "Guardando..." : "Guardar cambios"}</button>
              </form>
            ) : null}
          </section>
        ) : null}

        <div className="pos-v2-module-preview__actions">
          <button type="button" onClick={() => navigate(-1)}>← Volver atrás</button>
          <button type="button" onClick={() => navigate("/v2/more")}>Ir a Más</button>
        </div>
      </section>
    </PosV2Shell>
  );
};
