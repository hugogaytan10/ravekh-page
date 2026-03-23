import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PosV2MorePage.css";

const TOKEN_KEY = "pos-v2-token";
const BUSINESS_ID_KEY = "pos-v2-business-id";

type MoreLinkStatus = "available" | "beta" | "preview";

type MoreLink = {
  id: string;
  title: string;
  description: string;
  path: string;
  status: MoreLinkStatus;
};

type MoreSection = {
  title: string;
  subtitle: string;
  items: MoreLink[];
};

const previewPath = (id: string) => `/v2/more/preview/${id}`;

const MORE_SECTIONS: MoreSection[] = [
  {
    title: "Operación diaria",
    subtitle: "Flujos principales del POS que ya están funcionales en v2.",
    items: [
      { id: "sales", title: "Ventas", description: "Punto de venta y cobro rápido.", path: "/v2/MainSales", status: "available" },
      { id: "products", title: "Productos", description: "Catálogo y edición de artículos.", path: "/v2/main-products/items", status: "available" },
      { id: "finances", title: "Finanzas", description: "Registro de ingresos y egresos.", path: "/v2/MainFinances", status: "available" },
      { id: "reports", title: "Reportes", description: "Balance, ingresos, ganancias y pedidos por periodo.", path: "/v2/dashboard", status: "available" },
    ],
  },
  {
    title: "Configuración",
    subtitle: "Paridad estructural con Ajustes legacy, 100% en módulo moderno.",
    items: [
      { id: "tables", title: "Mesas y zonas", description: "Gestión de mesas para consumo en salón.", path: "/v2/settings/table-zones", status: "available" },
      { id: "business", title: "Información del negocio", description: "Datos fiscales/comerciales del negocio.", path: previewPath("business"), status: "beta" },
      { id: "catalog-settings", title: "Configuración catálogo", description: "Preferencias de publicación del catálogo.", path: previewPath("catalog-settings"), status: "preview" },
      { id: "sales-tax", title: "Impuesto de venta", description: "Ajustes de impuestos aplicados en ventas.", path: previewPath("sales-tax"), status: "beta" },
      { id: "branding", title: "Color de app", description: "Branding de colores para el POS.", path: previewPath("branding"), status: "beta" },
      { id: "exports", title: "Exportar reportes", description: "Descarga reportes para contabilidad.", path: previewPath("exports"), status: "beta" },
      { id: "inventory", title: "Inventario", description: "Módulo de stock desacoplado para v2.", path: previewPath("inventory"), status: "beta" },
      { id: "customers", title: "Clientes", description: "Catálogo de clientes y seguimiento.", path: previewPath("customers"), status: "beta" },
      { id: "employees", title: "Empleados", description: "Administración de personal y permisos.", path: previewPath("employees"), status: "beta" },
      { id: "cash-closing", title: "Corte de caja", description: "Cierres de caja al final de turno.", path: previewPath("cash-closing"), status: "beta" },
    ],
  },
  {
    title: "Servicios",
    subtitle: "Herramientas de soporte y operación extendida.",
    items: [
      { id: "health", title: "Salud de API", description: "Verifica conectividad y disponibilidad backend.", path: "/v2/health", status: "available" },
      { id: "online-store", title: "Tienda en línea", description: "Gestión de catálogo digital y canal online.", path: previewPath("online-store"), status: "beta" },
      { id: "loyalty", title: "Cupones y visitas", description: "Herramientas de fidelización y recompensas.", path: previewPath("loyalty"), status: "beta" },
      { id: "support", title: "Ayuda", description: "Centro de ayuda y soporte para el negocio.", path: previewPath("support"), status: "preview" },
      { id: "delete-account", title: "Borrar cuenta", description: "Proceso de baja y eliminación de cuenta.", path: previewPath("delete-account"), status: "preview" },
    ],
  },
];

export const PosV2MorePage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | MoreLinkStatus>("all");
  const allItems = useMemo(() => MORE_SECTIONS.flatMap((section) => section.items), []);
  const availableCount = allItems.filter((item) => item.status === "available").length;
  const normalizedQuery = query.trim().toLowerCase();

  const filteredSections = useMemo(() => {
    return MORE_SECTIONS.map((section) => {
      const items = section.items.filter((item) => {
        const matchesStatus = statusFilter === "all" ? true : item.status === statusFilter;
        const matchesQuery =
          normalizedQuery.length === 0
            ? true
            : `${item.title} ${item.description}`.toLowerCase().includes(normalizedQuery);

        return matchesStatus && matchesQuery;
      });

      return { ...section, items };
    }).filter((section) => section.items.length > 0);
  }, [normalizedQuery, statusFilter]);

  const handleSignOut = () => {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(BUSINESS_ID_KEY);
    navigate("/v2/login-punto-venta");
  };

  return (
    <PosV2Shell title="Más" subtitle="Centro operativo POS v2 desacoplado del legacy y preparado para pruebas end-to-end">
      <section className="pos-v2-more">
        <header className="pos-v2-more__header">
          <h2>Centro de operaciones</h2>
          <p>
            Todo abre dentro de la SPA sin refrescar la página. Lo productivo está marcado como <strong>Disponible</strong> y
            lo pendiente como <strong>Vista previa</strong> para poder validar navegación completa desde ahora.
          </p>
          <button type="button" className="pos-v2-more__back" onClick={() => navigate("/v2/MainSales")}>
            ← Volver a Ventas
          </button>
          <div className="pos-v2-more__toolbar">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar módulo..."
              aria-label="Buscar módulo"
            />
            <div className="pos-v2-more__chips">
              <button type="button" className={statusFilter === "all" ? "is-active" : ""} onClick={() => setStatusFilter("all")}>
                Todos
              </button>
              <button type="button" className={statusFilter === "available" ? "is-active" : ""} onClick={() => setStatusFilter("available")}>
                Disponibles
              </button>
              <button type="button" className={statusFilter === "beta" ? "is-active" : ""} onClick={() => setStatusFilter("beta")}>
                Beta
              </button>
              <button type="button" className={statusFilter === "preview" ? "is-active" : ""} onClick={() => setStatusFilter("preview")}>
                Vista previa
              </button>
            </div>
          </div>
        </header>

        <section className="pos-v2-more__qa" aria-label="Estado de pruebas del sistema">
          <h3>Checklist de testing</h3>
          <p>
            {availableCount} módulos listos y {allItems.length - availableCount} en vista previa. Puedes recorrer todos los
            flujos desde este panel para QA funcional de navegación.
          </p>
          <div className="pos-v2-more__qa-grid">
            {allItems.map((item) => (
              <button key={`qa-${item.id}`} type="button" className="pos-v2-more__qa-item" onClick={() => navigate(item.path)}>
                <span>{item.title}</span>
                <small className={item.status === "available" ? "is-available" : item.status === "beta" ? "is-beta" : "is-preview"}>
                  {item.status === "available" ? "Disponible" : item.status === "beta" ? "Beta" : "Vista previa"}
                </small>
              </button>
            ))}
          </div>
        </section>

        {filteredSections.map((section) => (
          <section key={section.title} className="pos-v2-more__section" aria-label={section.title}>
            <div className="pos-v2-more__section-head">
              <h3>{section.title}</h3>
              <p>{section.subtitle}</p>
            </div>
            <div className="pos-v2-more__grid">
              {section.items.map((item) => (
                <article key={`${section.title}-${item.title}`} className="pos-v2-more__item">
                  <div className="pos-v2-more__meta">
                    <h4>{item.title}</h4>
                    <span className={item.status === "available" ? "is-available" : item.status === "beta" ? "is-beta" : "is-preview"}>
                      {item.status === "available" ? "Disponible" : item.status === "beta" ? "Beta" : "Vista previa"}
                    </span>
                  </div>
                  <p>{item.description}</p>
                  <button type="button" onClick={() => navigate(item.path)} className="pos-v2-more__open">
                    Abrir módulo
                  </button>
                </article>
              ))}
            </div>
          </section>
        ))}

        {filteredSections.length === 0 ? (
          <section className="pos-v2-more__empty">
            <p>No encontramos módulos con ese filtro. Ajusta la búsqueda para continuar QA.</p>
          </section>
        ) : null}

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
