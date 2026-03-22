import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import { useNavigate } from "react-router-dom";
import "./PosV2MorePage.css";

const TOKEN_KEY = "pos-v2-token";
const BUSINESS_ID_KEY = "pos-v2-business-id";

type MoreLink = {
  title: string;
  description: string;
  path?: string;
  status?: "available" | "coming";
};

type MoreSection = {
  title: string;
  subtitle: string;
  items: MoreLink[];
};

const MORE_SECTIONS: MoreSection[] = [
  {
    title: "Operación diaria",
    subtitle: "Flujos principales del POS que ya están funcionales en v2.",
    items: [
      { title: "Ventas", description: "Punto de venta y cobro rápido.", path: "/v2/MainSales", status: "available" },
      { title: "Productos", description: "Catálogo y edición de artículos.", path: "/v2/main-products/items", status: "available" },
      { title: "Finanzas", description: "Registro de ingresos y egresos.", path: "/v2/MainFinances", status: "available" },
      { title: "Reportes", description: "Balance, ingresos, ganancias y pedidos por periodo.", path: "/v2/dashboard", status: "available" },
    ],
  },
  {
    title: "Configuración",
    subtitle: "Paridad estructural con Ajustes legacy, 100% en módulo moderno.",
    items: [
      { title: "Mesas y zonas", description: "Gestión de mesas para consumo en salón.", path: "/v2/settings/table-zones", status: "available" },
      { title: "Información del negocio", description: "Datos fiscales/comerciales del negocio.", status: "coming" },
      { title: "Configuración catálogo", description: "Preferencias de publicación del catálogo.", status: "coming" },
      { title: "Impuesto de venta", description: "Ajustes de impuestos aplicados en ventas.", status: "coming" },
      { title: "Color de app", description: "Branding de colores para el POS.", status: "coming" },
      { title: "Exportar reportes", description: "Descarga reportes para contabilidad.", status: "coming" },
      { title: "Inventario", description: "Módulo de stock desacoplado para v2.", status: "coming" },
      { title: "Clientes", description: "Catálogo de clientes y seguimiento.", status: "coming" },
      { title: "Empleados", description: "Administración de personal y permisos.", status: "coming" },
      { title: "Corte de caja", description: "Cierres de caja al final de turno.", status: "coming" },
    ],
  },
  {
    title: "Servicios",
    subtitle: "Herramientas de soporte y operación extendida.",
    items: [
      { title: "Salud de API", description: "Verifica conectividad y disponibilidad backend.", path: "/v2/health", status: "available" },
      { title: "Tienda en línea", description: "Gestión de catálogo digital y canal online.", status: "coming" },
      { title: "Cupones y visitas", description: "Herramientas de fidelización y recompensas.", status: "coming" },
      { title: "Ayuda", description: "Centro de ayuda y soporte para el negocio.", status: "coming" },
      { title: "Borrar cuenta", description: "Proceso de baja y eliminación de cuenta.", status: "coming" },
    ],
  },
];

export const PosV2MorePage = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(BUSINESS_ID_KEY);
    navigate("/v2/login-punto-venta");
  };

  const handleNavigate = (path?: string) => {
    if (!path) return;
    navigate(path);
  };

  return (
    <PosV2Shell title="Más" subtitle="Centro operativo POS v2 más fiel al legacy, desacoplado y escalable">
      <section className="pos-v2-more">
        <header>
          <h2>Centro de operaciones</h2>
          <p>Aquí concentramos accesos equivalentes al módulo legacy, priorizando lo ya disponible en v2 y señalando lo que sigue.</p>
        </header>

        {MORE_SECTIONS.map((section) => (
          <section key={section.title} className="pos-v2-more__section" aria-label={section.title}>
            <div className="pos-v2-more__section-head">
              <h3>{section.title}</h3>
              <p>{section.subtitle}</p>
            </div>
            <div className="pos-v2-more__grid">
              {section.items.map((item) => (
                <article key={`${section.title}-${item.title}`}>
                  <div className="pos-v2-more__meta">
                    <h4>{item.title}</h4>
                    <span className={item.status === "available" ? "is-available" : "is-coming"}>
                      {item.status === "available" ? "Disponible" : "Próximamente"}
                    </span>
                  </div>
                  <p>{item.description}</p>
                  <button type="button" onClick={() => handleNavigate(item.path)} disabled={!item.path}>
                    {item.path ? "Abrir" : "No disponible aún"}
                  </button>
                </article>
              ))}
            </div>
          </section>
        ))}

        <section className="pos-v2-more__actions">
          <article>
            <h3>Sesión actual</h3>
            <p>Usa esta acción para cambiar negocio o vendedor sin arrastrar token/businessId inválidos.</p>
            <button type="button" onClick={handleSignOut}>Cambiar usuario / cerrar sesión</button>
          </article>
        </section>
      </section>
    </PosV2Shell>
  );
};
