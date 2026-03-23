import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";

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

  const data = useMemo<PreviewData>(() => {
    return (
      PREVIEW_MODULES[moduleId] ?? {
        title: "Módulo en preparación",
        description: "Este acceso fue reservado para que QA pueda validar la navegación integral del POS v2 sin hard refresh.",
        eta: "Planificación abierta",
      }
    );
  }, [moduleId]);

  return (
    <PosV2Shell title={data.title} subtitle="Vista previa de módulo POS v2">
      <section
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "1rem",
          boxShadow: "0 10px 25px -20px rgba(0,0,0,0.35)",
          display: "grid",
          gap: "0.75rem",
        }}
      >
        <h2 style={{ margin: 0 }}>{data.title}</h2>
        <p style={{ margin: 0, color: "#475569" }}>{data.description}</p>
        <p style={{ margin: 0, color: "#6d01d1", fontWeight: 600 }}>Entrega estimada: {data.eta}</p>
        <div>
          <button
            type="button"
            onClick={() => navigate("/v2/more")}
            style={{
              border: 0,
              background: "#6d01d1",
              color: "#fff",
              borderRadius: "10px",
              padding: "0.55rem 0.95rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Volver a Más
          </button>
        </div>
      </section>
    </PosV2Shell>
  );
};
