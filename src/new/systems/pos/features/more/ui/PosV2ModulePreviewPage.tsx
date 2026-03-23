import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import { MoreModulePage } from "../pages/MoreModulePage";
import { MoreModuleService } from "../services/MoreModuleService";
import { MORE_MODULE_SECTIONS } from "../config/moreModules";
import "./PosV2ModulePreviewPage.css";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://apipos.ravekh.com/api/";

type PreviewData = {
  title: string;
  description: string;
  eta: string;
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
  },
};

export const PosV2ModulePreviewPage = () => {
  const { moduleId = "" } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [betaResponse, setBetaResponse] = useState("");
  const [betaError, setBetaError] = useState("");

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

  return (
    <PosV2Shell title={data.title} subtitle="Vista previa de módulo POS v2">
      <section className="pos-v2-module-preview">
        <h2>{data.title}</h2>
        <p>{data.description}</p>
        <p className="pos-v2-module-preview__eta">Entrega estimada: {data.eta}</p>

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

        <div className="pos-v2-module-preview__actions">
          <button type="button" onClick={() => navigate(-1)}>← Volver atrás</button>
          <button type="button" onClick={() => navigate("/v2/more")}>Ir a Más</button>
        </div>
      </section>
    </PosV2Shell>
  );
};
