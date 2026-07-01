import { ModernSystemsFactory } from "../../../../../index";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MORE_MODULE_SECTIONS } from "../config/moreModules";
import {
  MoreModuleExecutionContext,
  MoreModuleLink,
} from "../model/MoreModule";
import { MoreModuleService } from "../services/MoreModuleService";
import { MoreModulePage } from "../pages/MoreModulePage";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import {
  clearPosSessionSnapshot,
  isSalesOnlyOperator,
  POS_SESSION_STORAGE_KEYS,
  readPosSessionSnapshot,
  readPosStringList,
  writePosStringList,
} from "../../../shared/config/posSession";
import { POS_V2_PATHS } from "../../../routing/PosV2Paths";
import { buildPosPublicCatalogUrl } from "../../../shared/config/posExternalLinks";
import { onPosBusinessUpdated } from "../../../shared/config/posBusinessEvents";
import {
  fetchPosBusinessFeatures,
  isPosFeatureBlocked,
  isPosModuleBlocked,
  POS_FEATURES_UNKNOWN,
  PosBusinessFeatures,
} from "../../../shared/config/posFeatureFlags";
import {
  FeatureUnlockModal,
  type UnlockFeature,
} from "../../../shared/ui/FeatureUnlockModal";
import { usePlanActionGuard } from "../../../shared/hooks/usePlanActionGuard";
import { PlanUpgradeModal } from "../../../shared/ui/PlanUpgradeModal";
import { downloadProductsCatalogPdf } from "./productCatalogPdf";
import "./PosV2MorePage.css";

const API_BASE_URL = getPosApiBaseUrl();
const FAVORITES_KEY = POS_SESSION_STORAGE_KEYS.moreFavorites;

export const PosV2MorePage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [betaLoadingId, setBetaLoadingId] = useState<string | null>(null);
  const [betaResult, setBetaResult] = useState<{
    id: string;
    title: string;
    payload: string;
  } | null>(null);
  const [betaError, setBetaError] = useState<string>("");
  const [favorites, setFavorites] = useState<string[]>(() =>
    readPosStringList(FAVORITES_KEY),
  );
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [actionMessage, setActionMessage] = useState<string>("");
  const [features, setFeatures] =
    useState<PosBusinessFeatures>(POS_FEATURES_UNKNOWN);
  const [unlockModal, setUnlockModal] = useState<{
    title: string;
    message: string;
    buttonText: string;
    unlockFeature?: UnlockFeature;
  } | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const {
    runWithPlanAccess,
    blockedAction,
    closeBlockedActionModal,
    goToUpgradePlan,
    checkingPlanAccess,
  } = usePlanActionGuard();

  const modulePage = useMemo(
    () => new MoreModulePage(new MoreModuleService(API_BASE_URL)),
    [],
  );
  const productsService = useMemo(() => {
    const factory = new ModernSystemsFactory(API_BASE_URL);
    return factory.createPosProductsService();
  }, []);
  const sessionSnapshot = useMemo(() => readPosSessionSnapshot(), []);
  const isSalesOnlyUser = useMemo(
    () => isSalesOnlyOperator(sessionSnapshot.token),
    [sessionSnapshot.token],
  );
  const allowedModuleIdsForSalesOnly = useMemo(() => new Set(["printers"]), []);
  const catalogUrl = useMemo(
    () => buildPosPublicCatalogUrl(sessionSnapshot.businessId),
    [sessionSnapshot.businessId],
  );
  const allItems = useMemo(() => {
    const items = MORE_MODULE_SECTIONS.flatMap((section) => section.items);
    if (!isSalesOnlyUser) return items;
    return items.filter((item) => allowedModuleIdsForSalesOnly.has(item.id));
  }, [allowedModuleIdsForSalesOnly, isSalesOnlyUser]);
  const isReadyModule = (item: MoreModuleLink): boolean =>
    item.status === "available" ||
    (item.actionType === "beta-action" &&
      modulePage.supportsInlineExecution(item.id));
  const workingItems = useMemo(
    () => allItems.filter((item) => isReadyModule(item)),
    [allItems],
  );
  const summary = useMemo(
    () => ({
      total: workingItems.length,
      working: workingItems.length,
      favorites: favorites.length,
    }),
    [workingItems.length, favorites.length],
  );
  const favoriteItems = allItems
    .filter((item) => favorites.includes(item.id))
    .sort((a, b) => a.title.localeCompare(b.title, "es-MX"));
  const normalizedQuery = query.trim().toLowerCase();

  const filteredSections = useMemo(() => {
    return MORE_MODULE_SECTIONS.map((section) => {
      const items = section.items.filter((item) => {
        const matchesRole =
          !isSalesOnlyUser || allowedModuleIdsForSalesOnly.has(item.id);
        const matchesStatus = isReadyModule(item);
        const matchesQuery =
          normalizedQuery.length === 0
            ? true
            : `${item.title} ${item.description}`
                .toLowerCase()
                .includes(normalizedQuery);

        return matchesRole && matchesStatus && matchesQuery;
      });

      return { ...section, items };
    }).filter((section) => section.items.length > 0);
  }, [
    allowedModuleIdsForSalesOnly,
    isSalesOnlyUser,
    normalizedQuery,
    modulePage,
  ]);

  useEffect(() => {
    if (!sessionSnapshot.token || !sessionSnapshot.businessId) return;

    const loadBusinessState = () => {
      fetchPosBusinessFeatures(
        sessionSnapshot.businessId,
        sessionSnapshot.token,
        API_BASE_URL,
      )
        .then(setFeatures)
        .catch(() => setFeatures(POS_FEATURES_UNKNOWN));
    };

    loadBusinessState();

    return onPosBusinessUpdated((detail) => {
      if (detail.businessId !== sessionSnapshot.businessId) return;
      loadBusinessState();
    });
  }, [sessionSnapshot.businessId, sessionSnapshot.token]);

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
      current.includes(moduleId)
        ? current.filter((id) => id !== moduleId)
        : [...current, moduleId],
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
      setActionMessage(
        "No fue posible copiar la URL. Puedes copiarla manualmente.",
      );
    }
  };
  const currentPlanName = useMemo(() => {
    const remotePlan = features.plan?.trim();

    if (remotePlan) {
      return remotePlan;
    }

    try {
      return window.localStorage.getItem("plan")?.trim() || "No disponible";
    } catch {
      return "No disponible";
    }
  }, [features.plan]);

  const openChangePlanModal = () => {
    setUnlockModal({
      title: "Cambia tu plan",
      message: `Tu negocio está actualmente en el plan ${currentPlanName}. Sube de plan para desbloquear más capacidad, catálogo online y herramientas premium.`,
      buttonText: "Continuar al pago",
      unlockFeature: "Catalog",
    });
  };

  const downloadProductsPdf = async () =>
    runWithPlanAccess("products.printPdf", async () => {
      if (!sessionSnapshot.token || !sessionSnapshot.businessId) {
        setActionMessage("Inicia sesión para descargar el PDF de productos.");
        return;
      }

      setPdfLoading(true);
      setActionMessage("Preparando PDF de productos...");

      try {
        const products = await productsService.listReallyAllProducts(
          sessionSnapshot.businessId,
          sessionSnapshot.token,
        );
        if (products.length === 0) {
          setActionMessage(
            "No encontramos productos disponibles para exportar en PDF.",
          );
          return;
        }
        await downloadProductsCatalogPdf(products, API_BASE_URL);
        setActionMessage(
          `PDF de productos descargado (${products.length} productos).`,
        );
      } catch (cause) {
        setActionMessage(
          cause instanceof Error
            ? cause.message
            : "No fue posible descargar el PDF de productos.",
        );
      } finally {
        setPdfLoading(false);
      }
    });

  const openUnlockModal = (
    title: string,
    message: string,
    buttonText: string,
    unlockFeature?: UnlockFeature,
  ) => {
    setUnlockModal({ title, message, buttonText, unlockFeature });
  };

  const getLockedModule = (
    item: MoreModuleLink,
  ): {
    title: string;
    message: string;
    buttonText: string;
    unlockFeature?: UnlockFeature;
  } | null => {
    if (item.id === "sales" && isPosModuleBlocked(features)) {
      return {
        title: "Ventas bloqueadas",
        message:
          "Tu módulo POS está desactivado. Desbloquéalo para acceder a ventas, cobrar más rápido y vender sin límites.",
        buttonText: "Desbloquear POS",
        unlockFeature: "Pos",
      };
    }

    if (
      (item.id === "online-store" || item.id === "catalog-settings") &&
      isPosFeatureBlocked(features.catalog)
    ) {
      return {
        title: "Desbloquea tu tienda en línea",
        message:
          "Activa el catálogo para vender en línea, mostrar tus productos y recibir pedidos desde tu tienda digital.",
        buttonText: "Desbloquear catálogo",
        unlockFeature: "Catalog",
      };
    }

    if (
      (item.id === "coupons" ||
        item.id === "visits" ||
        item.id === "loyalty") &&
      features.fidelity !== 1 &&
      features.fidelity !== 2
    ) {
      return {
        title: "Desbloquea fidelidad",
        message:
          "Activa las herramientas de fidelidad para crear cupones, registrar visitas y premiar a tus clientes frecuentes.",
        buttonText: "Desbloquear fidelidad",
        unlockFeature: "Fidelity",
      };
    }

    return null;
  };

  const runBetaAction = async (item: MoreModuleLink) => {
    const context: MoreModuleExecutionContext = readPosSessionSnapshot();

    setBetaLoadingId(item.id);
    setBetaError("");
    setBetaResult(null);
    try {
      const result = await modulePage.execute(item.id, item.title, context);
      setBetaResult({
        id: item.id,
        title: item.title,
        payload: JSON.stringify(result.payload, null, 2),
      });
    } catch (cause) {
      setBetaError(
        cause instanceof Error
          ? cause.message
          : "No fue posible ejecutar la acción beta.",
      );
    } finally {
      setBetaLoadingId(null);
    }
  };

  const openAllowedModule = async (item: MoreModuleLink) => {
    const lockedModule = getLockedModule(item);
    if (lockedModule) {
      openUnlockModal(
        lockedModule.title,
        lockedModule.message,
        lockedModule.buttonText,
        lockedModule.unlockFeature,
      );
      return;
    }

    if (item.id === "cash-closing") {
      navigate(POS_V2_PATHS.cashClosing);
      return;
    }

    const shouldRunInline =
      item.actionType === "beta-action" &&
      modulePage.supportsInlineExecution(item.id);
    if (shouldRunInline) {
      await runBetaAction(item);
      return;
    }

    navigate(item.path);
  };

  const openModule = async (item: MoreModuleLink) => {
    await openAllowedModule(item);
  };

  return (
    <PosV2Shell
      title="Más"
      subtitle="Centro operativo POS v2 desacoplado del código anterior y preparado para pruebas end-to-end"
    >
      <section className="pos-v2-more">
        <header className="pos-v2-more__header">
          <h2>Centro de operaciones</h2>
        </header>
        <section className="pos-v2-more__plan-banner" aria-label="Cambiar plan">
          <div>
            <span className="pos-v2-more__plan-eyebrow">Plan actual</span>
            <h3>Cambiar plan de pago</h3>
            <p>
              Tu negocio está en el plan <strong>{currentPlanName}</strong>.
              Sube de plan para desbloquear más capacidad, catálogo online y
              herramientas premium.
            </p>
          </div>

          <button
            type="button"
            className="pos-v2-more__plan-primary"
            onClick={openChangePlanModal}
          >
            Cambiar / subir plan
          </button>
        </section>

        {favoriteItems.length > 0 ? (
          <section
            className="pos-v2-more__favorites"
            aria-label="Accesos rápidos"
          >
            <div className="pos-v2-more__section-head">
              <h3>Accesos rápidos</h3>
              <p>
                Módulos marcados para entrar más rápido durante la operación
                diaria.
              </p>
            </div>
            <div className="pos-v2-more__favorites-head">
              <small>{favoriteItems.length} favorito(s)</small>
              <button
                type="button"
                className="pos-v2-more__clear-favorites"
                onClick={() => setFavorites([])}
              >
                Limpiar favoritos
              </button>
            </div>
            <div className="pos-v2-more__grid">
              {favoriteItems.map((item) => (
                <article
                  key={`favorite-${item.id}`}
                  className="pos-v2-more__item"
                >
                  <div className="pos-v2-more__meta">
                    <h4>{item.title}</h4>
                    <span className="is-available">Favorito</span>
                  </div>
                  <p>{item.description}</p>
                  <button
                    type="button"
                    onClick={() => openModule(item)}
                    className="pos-v2-more__open"
                  >
                    Abrir módulo
                  </button>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <section
            className="pos-v2-more__favorites pos-v2-more__favorites--empty"
            aria-label="Accesos rápidos"
          >
            <h3>Accesos rápidos</h3>
            <p>Marca con ☆ los módulos que más usas para verlos aquí.</p>
          </section>
        )}

        <section
          className="pos-v2-more__quick-tools"
          aria-label="Herramientas rápidas"
        >
          <div className="pos-v2-more__section-head">
            <h3>Herramientas rápidas</h3>
            <p>Acciones operativas que sí usamos en el día a día.</p>
          </div>
          <div className="pos-v2-more__quick-tools-grid">
            {allItems
              .filter((item) =>
                [
                  "coupons",
                  "visits",
                  "customers",
                  "employees",
                  "catalog-settings",
                  "exports",
                  "cash-closing",
                  "online-store",
                ].includes(item.id),
              )
              .map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openModule(item)}
                >
                  {item.title}
                </button>
              ))}
          </div>
          <div className="pos-v2-more__catalog-copy">
            <label htmlFor="public-catalog-url">URL pública de catálogo</label>
            <input id="public-catalog-url" value={catalogUrl} readOnly />
            <div className="pos-v2-more__quick-tools-grid">
              <button
                type="button"
                onClick={() => {
                  if (isPosFeatureBlocked(features.catalog)) {
                    openUnlockModal(
                      "Desbloquea tu tienda en línea",
                      "Activa el catálogo para vender en línea, mostrar tus productos y recibir pedidos desde tu tienda digital.",
                      "Desbloquear catálogo",
                      "Catalog",
                    );
                    return;
                  }
                  window.open(catalogUrl, "_blank", "noopener,noreferrer");
                }}
              >
                Abrir catálogo
              </button>
              <button type="button" onClick={() => void copyCatalogUrl()}>
                Copiar URL
              </button>
            </div>
          </div>
          <div className="pos-v2-more__pdf-download">
            <div>
              <h4>Catálogo completo en PDF</h4>
              <p>
                Descarga todos los productos registrados con sus imágenes en un
                documento.
              </p>
            </div>
            <button
              type="button"
              className="pos-v2-more__pdf-button"
              onClick={() => void downloadProductsPdf()}
              disabled={pdfLoading || checkingPlanAccess}
            >
              {checkingPlanAccess
                ? "Validando plan..."
                : pdfLoading
                  ? "Generando PDF..."
                  : "Descargar PDF"}
            </button>
          </div>
        </section>

        {filteredSections.map((section) => (
          <section
            key={section.title}
            className="pos-v2-more__section"
            aria-label={section.title}
          >
            <div className="pos-v2-more__section-head">
              <h3>{section.title}</h3>
              <p>{section.subtitle}</p>
            </div>
            <div className="pos-v2-more__grid">
              {section.items.map((item) => (
                <article
                  key={`${section.title}-${item.title}`}
                  className="pos-v2-more__item"
                >
                  <div className="pos-v2-more__meta">
                    <h4>{item.title}</h4>
                  </div>
                  <p>{item.description}</p>
                  <div className="pos-v2-more__item-actions">
                    <button
                      type="button"
                      onClick={() => openModule(item)}
                      className="pos-v2-more__open"
                      disabled={betaLoadingId === item.id}
                    >
                      {betaLoadingId === item.id
                        ? "Ejecutando..."
                        : "Abrir módulo"}
                    </button>
                    <button
                      type="button"
                      className={`pos-v2-more__favorite ${favorites.includes(item.id) ? "is-active" : ""}`}
                      onClick={() => toggleFavorite(item.id)}
                      aria-label={
                        favorites.includes(item.id)
                          ? `Quitar ${item.title} de favoritos`
                          : `Agregar ${item.title} a favoritos`
                      }
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
              }}
            >
              Limpiar filtros y volver a operativos
            </button>
          </section>
        ) : null}

        <section className="pos-v2-more__actions">
          <article>
            <h3>Sesión actual</h3>
            <p>
              Usa esta acción para cambiar negocio o vendedor sin arrastrar
              token/businessId inválidos.
            </p>
            <button type="button" onClick={() => setShowSignOutConfirm(true)}>
              Cambiar usuario / cerrar sesión
            </button>
          </article>
        </section>

        {betaError ? <p className="pos-v2-more__error">{betaError}</p> : null}
        {actionMessage ? (
          <p className="pos-v2-more__info">{actionMessage}</p>
        ) : null}

        {betaResult ? (
          <section
            className="pos-v2-more__result"
            aria-label={`Resultado módulo ${betaResult.title}`}
          >
            <header>
              <h3>Resultado: {betaResult.title}</h3>
              <button type="button" onClick={() => setBetaResult(null)}>
                Cerrar
              </button>
            </header>
            <pre>{betaResult.payload}</pre>
          </section>
        ) : null}

        <PlanUpgradeModal
          open={Boolean(blockedAction)}
          title={blockedAction?.title}
          message={blockedAction?.message}
          requiredPlan={blockedAction?.requiredPlan}
          ctaLabel={blockedAction?.ctaLabel}
          onClose={closeBlockedActionModal}
          onUpgrade={() => {
            closeBlockedActionModal();

            setUnlockModal({
              title: `Activa ${blockedAction?.requiredPlan ?? "tu plan"}`,
              message:
                "Completa el pago para activar el paquete seleccionado y desbloquear esta función.",
              buttonText: "Continuar al pago",
              unlockFeature: "Catalog",
            });
          }}
        />

        <FeatureUnlockModal
          open={Boolean(unlockModal)}
          onClose={() => setUnlockModal(null)}
          title={unlockModal?.title}
          message={unlockModal?.message}
          buttonText={unlockModal?.buttonText}
          unlockFeature={unlockModal?.unlockFeature}
          onPaymentSuccess={() => {
            setUnlockModal(null);
            navigate(POS_V2_PATHS.sales);
          }}
        />

        {showSignOutConfirm ? (
          <section
            className="pos-v2-more__modal"
            role="dialog"
            aria-modal="true"
            aria-label="Confirmar cierre de sesión"
            onClick={() => setShowSignOutConfirm(false)}
          >
            <article onClick={(event) => event.stopPropagation()}>
              <h3>¿Cambiar de usuario?</h3>
              <p>
                Se cerrará la sesión actual para iniciar con otra cuenta o
                negocio.
              </p>
              <div>
                <button
                  type="button"
                  className="is-secondary"
                  onClick={() => setShowSignOutConfirm(false)}
                >
                  Cancelar
                </button>
                <button type="button" onClick={handleSignOut}>
                  Cerrar sesión
                </button>
              </div>
            </article>
          </section>
        ) : null}
      </section>
    </PosV2Shell>
  );
};
