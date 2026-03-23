import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MORE_MODULE_SECTIONS } from "../config/moreModules";
import { MoreModuleLink, MoreModuleStatus } from "../model/MoreModule";
import { MoreModuleService } from "../services/MoreModuleService";
import { MoreModulePage } from "../pages/MoreModulePage";
import "./PosV2MorePage.css";

const TOKEN_KEY = "pos-v2-token";
const BUSINESS_ID_KEY = "pos-v2-business-id";
const EMPLOYEE_ID_KEY = "pos-v2-employee-id";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://apipos.ravekh.com/api/";

export const PosV2MorePage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | MoreModuleStatus>("all");
  const [betaLoadingId, setBetaLoadingId] = useState<string | null>(null);
  const [betaResult, setBetaResult] = useState<{ id: string; title: string; payload: string } | null>(null);
  const [betaError, setBetaError] = useState<string>("");

  const modulePage = useMemo(() => new MoreModulePage(new MoreModuleService(API_BASE_URL)), []);
  const allItems = useMemo(() => MORE_MODULE_SECTIONS.flatMap((section) => section.items), []);
  const availableCount = allItems.filter((item) => item.status === "available").length;
  const normalizedQuery = query.trim().toLowerCase();

  const filteredSections = useMemo(() => {
    return MORE_MODULE_SECTIONS.map((section) => {
      const items = section.items.filter((item) => {
        const matchesStatus = statusFilter === "all" ? true : item.status === statusFilter;
        const matchesQuery = normalizedQuery.length === 0
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
    window.localStorage.removeItem(EMPLOYEE_ID_KEY);
    navigate("/v2/login-punto-venta");
  };

  const runBetaAction = async (item: MoreModuleLink) => {
    const token = (window.localStorage.getItem(TOKEN_KEY) ?? "").trim();
    const businessId = Number(window.localStorage.getItem(BUSINESS_ID_KEY) ?? "");
    const employeeId = Number(window.localStorage.getItem(EMPLOYEE_ID_KEY) ?? "");

    setBetaLoadingId(item.id);
    setBetaError("");
    setBetaResult(null);
    try {
      const result = await modulePage.execute(item.id, item.title, { token, businessId, employeeId });
      setBetaResult({ id: item.id, title: item.title, payload: JSON.stringify(result.payload, null, 2) });
    } catch (cause) {
      setBetaError(cause instanceof Error ? cause.message : "No fue posible ejecutar la acción beta.");
    } finally {
      setBetaLoadingId(null);
    }
  };

  const openModule = async (item: MoreModuleLink) => {
    if (item.id === "delete-account") {
      handleSignOut();
      return;
    }

    const shouldRunInline = item.actionType === "beta-action" && modulePage.supportsInlineExecution(item.id);
    if (shouldRunInline) {
      await runBetaAction(item);
      return;
    }

    navigate(item.path);
  };

  return (
    <PosV2Shell title="Más" subtitle="Centro operativo POS v2 desacoplado del legacy y preparado para pruebas end-to-end">
      <section className="pos-v2-more">
        <header className="pos-v2-more__header">
          <h2>Centro de operaciones</h2>
          <p>
            Todo abre dentro de la SPA sin refrescar la página. Lo productivo está marcado como <strong>Disponible</strong> y
            lo pendiente como <strong>Vista previa</strong>.
          </p>
          <button type="button" className="pos-v2-more__back" onClick={() => navigate("/v2/MainSales")}>
            ← Volver a Ventas
          </button>
          <div className="pos-v2-more__toolbar">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar módulo..." aria-label="Buscar módulo" />
            <div className="pos-v2-more__chips">
              <button type="button" className={statusFilter === "all" ? "is-active" : ""} onClick={() => setStatusFilter("all")}>Todos</button>
              <button type="button" className={statusFilter === "available" ? "is-active" : ""} onClick={() => setStatusFilter("available")}>Disponibles</button>
              <button type="button" className={statusFilter === "beta" ? "is-active" : ""} onClick={() => setStatusFilter("beta")}>Beta</button>
              <button type="button" className={statusFilter === "preview" ? "is-active" : ""} onClick={() => setStatusFilter("preview")}>Vista previa</button>
            </div>
          </div>
        </header>

        <section className="pos-v2-more__qa" aria-label="Estado de pruebas del sistema">
          <h3>Checklist de testing</h3>
          <p>{availableCount} módulos listos y {allItems.length - availableCount} en vista previa.</p>
          <div className="pos-v2-more__qa-grid">
            {allItems.map((item) => (
              <button key={`qa-${item.id}`} type="button" className="pos-v2-more__qa-item" onClick={() => openModule(item)}>
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
                  <button type="button" onClick={() => openModule(item)} className="pos-v2-more__open" disabled={betaLoadingId === item.id}>
                    {betaLoadingId === item.id ? "Ejecutando..." : "Abrir módulo"}
                  </button>
                </article>
              ))}
            </div>
          </section>
        ))}

        {filteredSections.length === 0 ? <section className="pos-v2-more__empty"><p>No encontramos módulos con ese filtro.</p></section> : null}

        <section className="pos-v2-more__actions">
          <article>
            <h3>Sesión actual</h3>
            <p>Usa esta acción para cambiar negocio o vendedor sin arrastrar token/businessId inválidos.</p>
            <button type="button" onClick={handleSignOut}>Cambiar usuario / cerrar sesión</button>
          </article>
        </section>

        {betaError ? <p className="pos-v2-more__error">{betaError}</p> : null}

        {betaResult ? (
          <section className="pos-v2-more__result" aria-label={`Resultado módulo ${betaResult.title}`}>
            <header>
              <h3>Resultado: {betaResult.title}</h3>
              <button type="button" onClick={() => setBetaResult(null)}>Cerrar</button>
            </header>
            <pre>{betaResult.payload}</pre>
          </section>
        ) : null}
      </section>
    </PosV2Shell>
  );
};
