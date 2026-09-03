import { MouseEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FiBarChart2, FiBox, FiDollarSign, FiMoreHorizontal, FiShoppingCart } from "react-icons/fi";
import { isSalesOnlyOperator, readPosSessionSnapshot } from "../config/posSession";
import { POS_V2_PATHS } from "../../routing/PosV2Paths";
import { fetchPosBusinessFeatures, isPosModuleBlocked, POS_FEATURES_UNKNOWN, PosBusinessFeatures } from "../config/posFeatureFlags";
import { onPosBusinessUpdated } from "../config/posBusinessEvents";
import { FeatureUnlockModal } from "./FeatureUnlockModal";
import { ModernSystemsFactory } from "../../../../index";
import { getPosApiBaseUrl } from "../config/posEnv";
import "../../features/auth/ui/PosV2LoginPage.css";
import "./PosV2Shell.css";

type PosV2ShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

type UiTheme = "light" | "dark";

const THEME_STORAGE_KEY = "pos-v2-ui-theme";

const NAV_ITEMS = [
  { to: POS_V2_PATHS.sales, label: "Ventas", Icon: FiShoppingCart },
  { to: POS_V2_PATHS.products, label: "Productos", Icon: FiBox },
  { to: POS_V2_PATHS.finances, label: "Finanzas", Icon: FiDollarSign },
  { to: POS_V2_PATHS.reports, label: "Reportes", Icon: FiBarChart2 },
  { to: POS_V2_PATHS.more, label: "Más", Icon: FiMoreHorizontal },
];

export const PosV2Shell = ({ title, children }: PosV2ShellProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [features, setFeatures] = useState<PosBusinessFeatures>(POS_FEATURES_UNKNOWN);
  const [showSalesUnlock, setShowSalesUnlock] = useState(false);
  const [showChangesNotice, setShowChangesNotice] = useState(false);
  const [acknowledgingChangesNotice, setAcknowledgingChangesNotice] = useState(false);
  const businessSettingsService = useMemo(
    () => new ModernSystemsFactory(getPosApiBaseUrl()).createPosBusinessSettingsService(),
    [],
  );
  const [theme, setTheme] = useState<UiTheme>(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }

    if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }

    return "light";
  });

  useEffect(() => {
    const session = readPosSessionSnapshot();
    if (!session.token || !session.businessId) return;

    const loadFeatures = () => {
      fetchPosBusinessFeatures(session.businessId, session.token)
        .then((nextFeatures) => setFeatures(nextFeatures))
        .catch(() => setFeatures(POS_FEATURES_UNKNOWN));
    };

    loadFeatures();

    return onPosBusinessUpdated((detail) => {
      if (detail.businessId !== session.businessId) return;
      loadFeatures();
    });
  }, [navigate]);

  useEffect(() => {
    const session = readPosSessionSnapshot();
    if (!session.token || !session.businessId) return;

    let active = true;
    businessSettingsService.getChangesNoticeStatus(session.businessId, session.token)
      .then((status) => {
        if (active && !status.viewed) setShowChangesNotice(true);
      })
      .catch((cause) => console.warn("No se pudo consultar el aviso de próximas actualizaciones:", cause));

    return () => {
      active = false;
    };
  }, [businessSettingsService]);

  const acknowledgeChangesNotice = async () => {
    if (acknowledgingChangesNotice) return;
    const session = readPosSessionSnapshot();
    if (!session.token || !session.businessId) return;

    setAcknowledgingChangesNotice(true);
    try {
      await businessSettingsService.acknowledgeChangesNotice(session.businessId, session.token);
      setShowChangesNotice(false);
    } catch (cause) {
      console.warn("No se pudo registrar la lectura del aviso de próximas actualizaciones:", cause);
    } finally {
      setAcknowledgingChangesNotice(false);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const navItems = useMemo(() => {
    const { token } = readPosSessionSnapshot();
    if (!token || !isSalesOnlyOperator(token)) return NAV_ITEMS;
    return NAV_ITEMS.filter((item) => item.to === POS_V2_PATHS.sales || item.to === POS_V2_PATHS.more);
  }, []);

  const shouldShowBottomNav = useMemo(() => {
    return navItems.some((item) => item.to === location.pathname);
  }, [location.pathname, navItems]);

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, to: string) => {
    if (to !== POS_V2_PATHS.sales || !isPosModuleBlocked(features)) return;
    event.preventDefault();
    setShowSalesUnlock(true);
  };

  return (
    <div className="pos-v2-shell">
      <header className="pos-v2-shell__header">
        <div className="pos-v2-shell__title-row">
          <button type="button" className="pos-v2-shell__back" onClick={() => navigate(-1)}>← Regresar</button>
          <h1 className="pos-v2-shell__title">{title}</h1>
        </div>
        <div className="pos-v2-shell__header-actions">
          <button
            type="button"
            className="pos-v2-shell__theme-toggle"
            onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
            aria-label={`Cambiar a modo ${theme === "dark" ? "claro" : "oscuro"}`}
            aria-pressed={theme === "dark"}
          >
            <span>Claro</span>
            <span className={`pos-v2-shell__theme-toggle-track ${theme === "dark" ? "is-dark" : ""}`} aria-hidden="true">
              <span className="pos-v2-shell__theme-toggle-thumb" />
            </span>
            <span>Oscuro</span>
          </button>
        </div>
      </header>

      <main className="pos-v2-shell__content">{children}</main>

      {shouldShowBottomNav ? (
        <nav className="pos-v2-shell__bottom-nav" aria-label="Navegación principal POS v2">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `pos-v2-shell__nav-item ${isActive ? "is-active" : ""}`}
              onClick={(event) => handleNavClick(event, to)}
            >
              {({ isActive }) => (
                <>
                  <Icon size={21} aria-hidden="true" />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      ) : null}

      <FeatureUnlockModal
        open={showSalesUnlock}
        onClose={() => setShowSalesUnlock(false)}
        title="Ventas bloqueadas"
        message="Tu módulo POS está desactivado. Desbloquéalo para acceder a ventas, cobrar más rápido y vender sin límites."
        buttonText="Desbloquear POS"
        unlockFeature="Pos"
      />
      {showChangesNotice ? (
        <div className="pos-v2-changes-notice-backdrop" role="presentation">
          <section
            className="pos-v2-changes-notice"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pos-v2-shell-changes-notice-title"
            aria-describedby="pos-v2-shell-changes-notice-description"
          >
            
            <span className="pos-v2-changes-notice__eyebrow">Novedades RAVEKH</span>
            <h2 id="pos-v2-shell-changes-notice-title">Próximas actualizaciones en RAVEKH</h2>
            <div id="pos-v2-shell-changes-notice-description" className="pos-v2-changes-notice__content">
              <p>Estamos realizando mejoras graduales en RAVEKH para seguir ofreciéndote una mejor experiencia y nuevos beneficios dentro de la plataforma, como la posibilidad de gestionar productos ilimitados.</p>
              <p>También estableceremos y comunicaremos nuestras condiciones de uso para que tengas mayor claridad sobre el funcionamiento del servicio y las responsabilidades de cada parte.</p>
              <p>Estas actualizaciones se implementarán poco a poco. Conforme se incorporen nuevas mejoras o entren en vigor las condiciones de uso, te informaremos dentro de la plataforma para que puedas conocerlas oportunamente.</p>
              <p>Por el momento, este mensaje es únicamente informativo y no requiere ninguna acción de tu parte.</p>
            </div>
            <button
              type="button"
              className="pos-v2-changes-notice__button"
              disabled={acknowledgingChangesNotice}
              onClick={() => void acknowledgeChangesNotice()}
            >
              {acknowledgingChangesNotice ? "Confirmando..." : "Entendido, continuar"}
            </button>
          </section>
        </div>
      ) : null}
    </div>
  );
};
