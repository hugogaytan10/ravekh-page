import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import { ModernSystemsFactory } from "../../../../../index";
import { MODULE_BETA_ACTIONS } from "./moduleBetaActions";
import "./PosV2ModulePreviewPage.css";

type PreviewData = {
  title: string;
  description: string;
  eta: string;
};

const PREVIEW_MODULES: Record<string, PreviewData> = {
  business: {
    title: "Información del negocio",
    description: "Pantalla puente para validar navegación SPA mientras finalizamos el desacople de ajustes fiscales y comerciales.",
    eta: "Sprint de configuración v2",
  },
  "catalog-settings": {
    title: "Configuración catálogo",
    description: "Aquí vivirá la configuración del catálogo online y sincronización de inventario en una capa independiente del legacy.",
    eta: "Sprint de catálogo v2",
  },
  "sales-tax": {
    title: "Impuesto de venta",
    description: "Vista preliminar para QA de rutas; el formulario final de impuestos quedará conectado al nuevo servicio de settings.",
    eta: "Sprint fiscal v2",
  },
  branding: {
    title: "Color de app",
    description: "Módulo en desarrollo para branding de interfaz por negocio sin afectar la navegación principal.",
    eta: "Sprint de personalización v2",
  },
  exports: {
    title: "Exportar reportes",
    description: "Ruta lista para pruebas de flujo; exportación real se conectará al módulo desacoplado de reporting.",
    eta: "Sprint de reportes v2",
  },
  inventory: {
    title: "Inventario",
    description: "Pantalla de validación de navegación mientras migramos control de stock al nuevo sistema POS.",
    eta: "Sprint de inventario v2",
  },
  customers: {
    title: "Clientes",
    description: "Punto de acceso preparado para QA antes de liberar el módulo completo de gestión de clientes.",
    eta: "Sprint de clientes v2",
  },
  employees: {
    title: "Empleados",
    description: "Preview funcional para validar UX de navegación. El CRUD de empleados entrará en el siguiente ciclo.",
    eta: "Sprint de empleados v2",
  },
  "cash-closing": {
    title: "Corte de caja",
    description: "Ruta habilitada para tests end-to-end de sesión y navegación sin recarga de página.",
    eta: "Sprint de caja v2",
  },
  "online-store": {
    title: "Tienda en línea",
    description: "Vista de transición para estabilizar el acceso desde Más y mantener continuidad en pruebas de QA.",
    eta: "Sprint omnicanal v2",
  },
  loyalty: {
    title: "Cupones y visitas",
    description: "Conector en progreso para integrar fidelización al nuevo ecosistema POS desacoplado.",
    eta: "Sprint loyalty v2",
  },
  support: {
    title: "Ayuda",
    description: "Punto central para documentación y soporte in-app, actualmente en construcción.",
    eta: "Sprint soporte v2",
  },
  "delete-account": {
    title: "Borrar cuenta",
    description: "Flujo sensible en diseño para cumplir UX y validaciones de seguridad antes de habilitar producción.",
    eta: "Sprint seguridad v2",
  },
};

export const PosV2ModulePreviewPage = () => {
  const { moduleId = "" } = useParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(() => window.localStorage.getItem("pos-v2-token") ?? "");
  const [businessIdInput, setBusinessIdInput] = useState(() => window.localStorage.getItem("pos-v2-business-id") ?? "");
  const [employeeIdInput, setEmployeeIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [betaResponse, setBetaResponse] = useState<string>("");
  const [betaError, setBetaError] = useState<string>("");

  const data = useMemo<PreviewData>(() => {
    return (
      PREVIEW_MODULES[moduleId] ?? {
        title: "Módulo en preparación",
        description: "Este acceso fue reservado para que QA pueda validar la navegación integral del POS v2 sin hard refresh.",
        eta: "Planificación abierta",
      }
    );
  }, [moduleId]);

  const moduleAction = MODULE_BETA_ACTIONS[moduleId];
  const hasToken = token.trim().length > 0;
  const businessId = Number(businessIdInput);
  const employeeId = Number(employeeIdInput);
  const hasBusinessId = Number.isFinite(businessId) && businessId > 0;

  const runBetaAction = async () => {
    if (!moduleAction) {
      setBetaError("Este módulo aún no tiene acciones beta habilitadas.");
      return;
    }

    if (!hasToken) {
      setBetaError("Ingresa token para probar funciones beta.");
      return;
    }

    if (moduleAction.requiresBusinessId && !hasBusinessId) {
      setBetaError("Ingresa un business id válido.");
      return;
    }

    if (moduleAction.requiresEmployeeId && (!Number.isFinite(employeeId) || employeeId <= 0)) {
      setBetaError("Para este módulo ingresa employee id válido.");
      return;
    }

    setLoading(true);
    setBetaError("");
    setBetaResponse("");

    try {
      const factory = new ModernSystemsFactory(
        (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://apipos.ravekh.com/api/",
      );
      const result = await moduleAction.run({ token: token.trim(), businessId, employeeId }, factory);
      setBetaResponse(JSON.stringify(result, null, 2));
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
        {moduleAction ? (
          <section className="pos-v2-module-preview__beta">
            <h3>Funciones beta disponibles</h3>
            <p>Ejecuta una lectura real del módulo para que puedas validar funcionalidad desde hoy.</p>
            <div className="pos-v2-module-preview__inputs">
              <input value={token} onChange={(event) => setToken(event.target.value)} placeholder="Token POS v2" />
              <input
                value={businessIdInput}
                onChange={(event) => setBusinessIdInput(event.target.value.replace(/[^\d]/g, ""))}
                placeholder="Business ID"
              />
              {moduleAction.requiresEmployeeId ? (
                <input
                  value={employeeIdInput}
                  onChange={(event) => setEmployeeIdInput(event.target.value.replace(/[^\d]/g, ""))}
                  placeholder="Employee ID"
                />
              ) : null}
            </div>
            <button type="button" onClick={runBetaAction} disabled={loading}>
              {loading ? "Ejecutando..." : "Probar función beta"}
            </button>
            {betaError ? <p className="pos-v2-module-preview__error">{betaError}</p> : null}
            {betaResponse ? <pre>{betaResponse}</pre> : null}
          </section>
        ) : null}
        <div className="pos-v2-module-preview__actions">
          <button type="button" onClick={() => navigate(-1)}>
            ← Volver atrás
          </button>
          <button type="button" onClick={() => navigate("/v2/more")}>
            Ir a Más
          </button>
        </div>
      </section>
    </PosV2Shell>
  );
};
