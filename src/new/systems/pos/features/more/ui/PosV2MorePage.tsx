import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import "./PosV2MorePage.css";

const TOKEN_KEY = "pos-v2-token";
const BUSINESS_ID_KEY = "pos-v2-business-id";

const QUICK_LINKS = [
  { title: "Salud de API", description: "Validar que el backend POS esté disponible.", path: "/v2/health" },
  { title: "Ventas", description: "Ir al flujo de ventas y caja.", path: "/v2/MainSales" },
  { title: "Productos", description: "Administrar catálogo desacoplado.", path: "/v2/main-products/items" },
  { title: "Finanzas", description: "Control diario de ingresos y egresos.", path: "/v2/MainFinances" },
  { title: "Reportes", description: "Analítica de desempeño por periodos.", path: "/v2/dashboard" },
];

export const PosV2MorePage = () => {
  const handleSignOut = () => {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(BUSINESS_ID_KEY);
    window.location.assign("/v2/login-punto-venta");
  };

  return (
    <PosV2Shell title="Más" subtitle="Centro operativo POS v2 con accesos modernos y utilidades">
      <section className="pos-v2-more">
        <header>
          <h2>Centro de operaciones</h2>
          <p>Accesos rápidos y acciones globales sin depender del módulo legacy.</p>
        </header>

        <section className="pos-v2-more__grid" aria-label="Accesos rápidos">
          {QUICK_LINKS.map((item) => (
            <article key={item.path}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <a href={item.path}>Abrir</a>
            </article>
          ))}
        </section>

        <section className="pos-v2-more__actions">
          <article>
            <h3>Sesión actual</h3>
            <p>Si hubo cambios de negocio/token, reinicia sesión para evitar errores de permisos.</p>
            <button type="button" onClick={handleSignOut}>Cerrar sesión v2</button>
          </article>
        </section>
      </section>
    </PosV2Shell>
  );
};
