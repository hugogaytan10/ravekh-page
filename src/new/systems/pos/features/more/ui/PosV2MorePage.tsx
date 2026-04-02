import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MORE_MODULE_SECTIONS } from "../config/moreModules";
import { MoreModuleExecutionContext, MoreModuleLink, MoreModuleStatus } from "../model/MoreModule";
import { MoreModuleService } from "../services/MoreModuleService";
import { MoreModulePage } from "../pages/MoreModulePage";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { clearPosSessionSnapshot, POS_SESSION_STORAGE_KEYS, readPosSessionSnapshot, readPosStringList, writePosStringList } from "../../../shared/config/posSession";
import { POS_V2_PATHS } from "../../../routing/PosV2Paths";
import { buildPosPublicCatalogUrl } from "../../../shared/config/posExternalLinks";
import "./PosV2MorePage.css";

const API_BASE_URL = getPosApiBaseUrl();
const FAVORITES_KEY = POS_SESSION_STORAGE_KEYS.moreFavorites;

export const PosV2MorePage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<"working" | "development">("working");
  const [statusFilter, setStatusFilter] = useState<"all" | MoreModuleStatus>("all");
  const [betaLoadingId, setBetaLoadingId] = useState<string | null>(null);
  const [betaResult, setBetaResult] = useState<{ id: string; title: string; payload: string } | null>(null);
  const [betaError, setBetaError] = useState<string>("");
  const [favorites, setFavorites] = useState<string[]>(() => readPosStringList(FAVORITES_KEY));
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [actionMessage, setActionMessage] = useState<string>("");

  const modulePage = useMemo(() => new MoreModulePage(new MoreModuleService(API_BASE_URL)), []);
  const sessionSnapshot = useMemo(() => readPosSessionSnapshot(), []);
  const catalogUrl = useMemo(() => buildPosPublicCatalogUrl(sessionSnapshot.businessId), [sessionSnapshot.businessId]);
  const allItems = useMemo(() => MORE_MODULE_SECTIONS.flatMap((section) => section.items), []);
  const isReadyModule = (item: MoreModuleLink): boolean =>
    item.status === "available" || (item.actionType === "beta-action" && modulePage.supportsInlineExecution(item.id));
  const workingItems = useMemo(() => allItems.filter((item) => isReadyModule(item)), [allItems]);
  const developmentItems = useMemo(() => allItems.filter((item) => item.status !== "available"), [allItems]);
  const summary = useMemo(() => ({
    total: allItems.length,
    working: workingItems.length,
    development: developmentItems.length,
    favorites: favorites.length,
  }), [allItems.length, workingItems.length, developmentItems.length, favorites.length]);
  const favoriteItems = allItems
    .filter((item) => favorites.includes(item.id))
    .sort((a, b) => a.title.localeCompare(b.title, "es-MX"));
  const pendingItems = allItems.filter((item) => item.status !== "available");
  const normalizedQuery = query.trim().toLowerCase();

  const filteredSections = useMemo(() => {
    const shouldIncludeItem = (item: MoreModuleLink): boolean => {
      if (viewMode === "working") return isReadyModule(item);
      if (statusFilter === "all") return item.status !== "available";
      return item.status === statusFilter;
    };

    return MORE_MODULE_SECTIONS.map((section) => {
      const items = section.items.filter((item) => {
        const matchesStatus = shouldIncludeItem(item);
        const matchesQuery = normalizedQuery.length === 0
          ? true
          : `${item.title} ${item.description}`.toLowerCase().includes(normalizedQuery);

        return matchesStatus && matchesQuery;
      });

      return { ...section, items };
    }).filter((section) => section.items.length > 0);
  }, [normalizedQuery, statusFilter, viewMode, modulePage]);

  useEffect(() => {
    writePosStringList(FAVORITES_KEY, favorites);
  }, [favorites]);

  useEffect(() => {
    if (!actionMessage) return;
    const timeout = window.setTimeout(() => setActionMessage(""), 2800);
    return () => window.clearTimeout(timeout);
  }, [actionMessage]);

  useEffect(() => {
    if (!showSignOutConfirm) return;

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowSignOutConfirm(false);
      }
    };

    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [showSignOutConfirm]);

  const toggleFavorite = (moduleId: string) => {
    setFavorites((current) =>
      current.includes(moduleId) ? current.filter((id) => id !== moduleId) : [...current, moduleId],
    );
  };

  const handleSignOut = () => {
    clearPosSessionSnapshot();
    navigate(POS_V2_PATHS.login);
  };

  const copyCatalogUrl = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(catalogUrl);
      } else {
        const helper = document.createElement("textarea");
        helper.value = catalogUrl;
        helper.setAttribute("readonly", "true");
        helper.style.position = "absolute";
        helper.style.left = "-9999px";
        document.body.appendChild(helper);
        helper.select();
        document.execCommand("copy");
        document.body.removeChild(helper);
      }

      setActionMessage("URL del catálogo copiada.");
    } catch {
      setActionMessage("No fue posible copiar la URL. Puedes copiarla manualmente.");
    }
  };

  const runBetaAction = async (item: MoreModuleLink) => {
    const context: MoreModuleExecutionContext = readPosSessionSnapshot();

    setBetaLoadingId(item.id);
    setBetaError("");
    setBetaResult(null);
    try {
      const result = await modulePage.execute(item.id, item.title, context);
      setBetaResult({ id: item.id, title: item.title, payload: JSON.stringify(result.payload, null, 2) });
    } catch (cause) {
      setBetaError(cause instanceof Error ? cause.message : "No fue posible ejecutar la acción beta.");
    } finally {
      setBetaLoadingId(null);
    }
  };

  const openModule = async (item: MoreModuleLink) => {
    if (item.id === "cash-closing") {
      navigate(POS_V2_PATHS.cashClosing);
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
    <PosV2Shell title="Más" subtitle="Centro operativo POS v2 desacoplado del código anterior y preparado para pruebas end-to-end">
      <section className="pos-v2-more">
        <header className="pos-v2-more__header">
          <h2>Centro de operaciones</h2>
          <p>
            Vista limpia del POS v2: solo módulos que ya funcionan o los que seguimos desarrollando en la nueva arquitectura.
          </p>
         
          <div className="pos-v2-more__toolbar">
            <div className="pos-v2-more__toolbar-head">
              <button type="button" className="pos-v2-more__back" onClick={() => navigate(-1)}>← Regresar</button>
              <div className="pos-v2-more__chips" role="group" aria-label="Vista de módulos">
                <button type="button" className={viewMode === "working" ? "is-active" : ""} onClick={() => { setViewMode("working"); setStatusFilter("all"); }}>Operativos</button>
                <button type="button" className={viewMode === "development" ? "is-active" : ""} onClick={() => setViewMode("development")}>En desarrollo</button>
              </div>
            </div>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar módulo..." aria-label="Buscar módulo" />
            {viewMode === "development" ? (
              <div className="pos-v2-more__chips" role="group" aria-label="Filtrar por estado">
                <button type="button" className={statusFilter === "all" ? "is-active" : ""} onClick={() => setStatusFilter("all")}>Todos</button>
                <button type="button" className={statusFilter === "beta" ? "is-active" : ""} onClick={() => setStatusFilter("beta")}>Beta</button>
                <button type="button" className={statusFilter === "preview" ? "is-active" : ""} onClick={() => setStatusFilter("preview")}>Preview</button>
              </div>
            ) : null}
          </div>

          <section className="pos-v2-more__summary" aria-label="Resumen de módulos">
            <article><h3>Total módulos</h3><p>{summary.total}</p></article>
            <article><h3>Operativos</h3><p>{summary.working}</p></article>
            <article><h3>En desarrollo</h3><p>{summary.development}</p></article>
            <article><h3>Favoritos</h3><p>{summary.favorites}</p></article>
          </section>
        </header>
        

        {favoriteItems.length > 0 ? (
          <section className="pos-v2-more__favorites" aria-label="Accesos rápidos">
            <div className="pos-v2-more__section-head">
              <h3>Accesos rápidos</h3>
              <p>Módulos marcados para entrar más rápido durante la operación diaria.</p>
            </div>
            <div className="pos-v2-more__favorites-head">
              <small>{favoriteItems.length} favorito(s)</small>
              <button type="button" className="pos-v2-more__clear-favorites" onClick={() => setFavorites([])}>
                Limpiar favoritos
              </button>
            </div>
            <div className="pos-v2-more__grid">
              {favoriteItems.map((item) => (
                <article key={`favorite-${item.id}`} className="pos-v2-more__item">
                  <div className="pos-v2-more__meta">
                    <h4>{item.title}</h4>
                    <span className="is-available">Favorito</span>
                  </div>
                  <p>{item.description}</p>
                  <button type="button" onClick={() => openModule(item)} className="pos-v2-more__open">Abrir módulo</button>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <section className="pos-v2-more__favorites pos-v2-more__favorites--empty" aria-label="Accesos rápidos">
            <h3>Accesos rápidos</h3>
            <p>Marca con ☆ los módulos que más usas para verlos aquí.</p>
          </section>
        )}

        <section className="pos-v2-more__quick-tools" aria-label="Herramientas rápidas">
          <div className="pos-v2-more__section-head">
            <h3>Herramientas rápidas</h3>
            <p>Acciones operativas que sí usamos en el día a día.</p>
          </div>
          <div className="pos-v2-more__quick-tools-grid">
            {allItems
              .filter((item) => ["coupons", "visits", "customers", "employees", "exports", "cash-closing", "online-store"].includes(item.id))
              .map((item) => (
                <button key={item.id} type="button" onClick={() => openModule(item)}>{item.title}</button>
              ))}
          </div>
          <div className="pos-v2-more__catalog-copy">
            <label htmlFor="public-catalog-url">URL pública de catálogo</label>
            <input id="public-catalog-url" value={catalogUrl} readOnly />
            <div className="pos-v2-more__quick-tools-grid">
              <button type="button" onClick={() => window.open(catalogUrl, "_blank", "noopener,noreferrer")}>
                Abrir catálogo
              </button>
              <button type="button" onClick={() => void copyCatalogUrl()}>
                Copiar URL
              </button>
            </div>
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
                  <div className="pos-v2-more__item-actions">
                    <button type="button" onClick={() => openModule(item)} className="pos-v2-more__open" disabled={betaLoadingId === item.id}>
                      {betaLoadingId === item.id ? "Ejecutando..." : "Abrir módulo"}
                    </button>
                    <button
                      type="button"
                      className={`pos-v2-more__favorite ${favorites.includes(item.id) ? "is-active" : ""}`}
                      onClick={() => toggleFavorite(item.id)}
                      aria-label={favorites.includes(item.id) ? `Quitar ${item.title} de favoritos` : `Agregar ${item.title} a favoritos`}
                    >
                      {favorites.includes(item.id) ? "★" : "☆"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}

        {filteredSections.length === 0 ? (
          <section className="pos-v2-more__empty">
            <p>No encontramos módulos con ese filtro.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setStatusFilter("all");
                setViewMode("working");
              }}
            >
              Limpiar filtros y volver a operativos
            </button>
          </section>
        ) : null}

        <section className="pos-v2-more__actions">
          <article>
            <h3>Sesión actual</h3>
            <p>Usa esta acción para cambiar negocio o vendedor sin arrastrar token/businessId inválidos.</p>
            <button type="button" onClick={() => setShowSignOutConfirm(true)}>Cambiar usuario / cerrar sesión</button>
          </article>
        </section>

        {betaError ? <p className="pos-v2-more__error">{betaError}</p> : null}
        {actionMessage ? <p className="pos-v2-more__info">{actionMessage}</p> : null}

        {betaResult ? (
          <section className="pos-v2-more__result" aria-label={`Resultado módulo ${betaResult.title}`}>
            <header>
              <h3>Resultado: {betaResult.title}</h3>
              <button type="button" onClick={() => setBetaResult(null)}>Cerrar</button>
            </header>
            <pre>{betaResult.payload}</pre>
          </section>
        ) : null}

        {showSignOutConfirm ? (
          <section
            className="pos-v2-more__modal"
            role="dialog"
            aria-modal="true"
            aria-label="Confirmar cierre de sesión"
            onClick={() => setShowSignOutConfirm(false)}
          >
            <article onClick={(event) => event.stopPropagation()}
              >
              <h3>¿Cambiar de usuario?</h3>
              <p>Se cerrará la sesión actual para iniciar con otra cuenta o negocio.</p>
              <div>
                <button type="button" className="is-secondary" onClick={() => setShowSignOutConfirm(false)}>Cancelar</button>
                <button type="button" onClick={handleSignOut}>Cerrar sesión</button>
              </div>
            </article>
          </section>
        ) : null}
      </section>
    </PosV2Shell>
  );
};
