import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import "./PosV2Shell.css";
import { SalesIcon } from "../../../../../assets/POS/SalesIcon";
import { ProductIcon } from "../../../../../assets/POS/Products";
import { FinanceIcon } from "../../../../../assets/POS/Finances";
import { ReportIcon } from "../../../../../assets/POS/Reports";
import { MoreIcon } from "../../../../../assets/POS/MoreIcon";

type PosV2ShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

const NAV_ITEMS = [
  { to: "/v2/MainSales", label: "Ventas", Icon: SalesIcon },
  { to: "/v2/main-products/items", label: "Productos", Icon: ProductIcon },
  { to: "/v2/MainFinances", label: "Finanzas", Icon: FinanceIcon },
  { to: "/v2/dashboard", label: "Reportes", Icon: ReportIcon },
  { to: "/v2/more", label: "Más", Icon: MoreIcon },
];

export const PosV2Shell = ({ title, subtitle, children }: PosV2ShellProps) => {
  return (
    <div className="pos-v2-shell">
      <header className="pos-v2-shell__header">
        <div>
          <p className="pos-v2-shell__brand">Ravekh POS</p>
          <h1 className="pos-v2-shell__title">{title}</h1>
          {subtitle ? <p className="pos-v2-shell__subtitle">{subtitle}</p> : null}
        </div>
        <span className="pos-v2-shell__badge">v2</span>
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
                <Icon width={26} height={26} strokeColor={isActive ? "#6D01D1" : "#C4C4C4"} strokeWidth={2} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
