import { ReactNode, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiBarChart2, FiBox, FiDollarSign, FiMoreHorizontal, FiShoppingCart } from "react-icons/fi";
import "./PosV2Shell.css";

type PosV2ShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

type UiTheme = "light" | "dark";

const THEME_STORAGE_KEY = "pos-v2-ui-theme";

const NAV_ITEMS = [
  { to: "/v2/MainSales", label: "Ventas", Icon: FiShoppingCart },
  { to: "/v2/main-products/items", label: "Productos", Icon: FiBox },
  { to: "/v2/MainFinances", label: "Finanzas", Icon: FiDollarSign },
  { to: "/v2/dashboard", label: "Reportes", Icon: FiBarChart2 },
  { to: "/v2/more", label: "Más", Icon: FiMoreHorizontal },
];

export const PosV2Shell = ({ title, subtitle, children }: PosV2ShellProps) => {
  const navigate = useNavigate();
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
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return (
    <div className="pos-v2-shell">
      <header className="pos-v2-shell__header">
        <div>
          <button type="button" className="pos-v2-shell__back" onClick={() => navigate(-1)}>← Regresar</button>
          <p className="pos-v2-shell__brand">Ravekh POS</p>
          <h1 className="pos-v2-shell__title">{title}</h1>
          {subtitle ? <p className="pos-v2-shell__subtitle">{subtitle}</p> : null}
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
          <span className="pos-v2-shell__badge">v2</span>
        </div>
      </header>

      <main className="pos-v2-shell__content">{children}</main>

      <nav className="pos-v2-shell__bottom-nav" aria-label="Navegación principal POS v2">
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `pos-v2-shell__nav-item ${isActive ? "is-active" : ""}`}
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
    </div>
  );
};
