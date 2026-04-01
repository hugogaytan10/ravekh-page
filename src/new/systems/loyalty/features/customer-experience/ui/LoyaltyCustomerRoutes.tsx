import { ReactNode } from "react";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { LoyaltyCustomerTokenPage } from "./pages/LoyaltyCustomerTokenPage";
import { LoyaltyCustomerVisitsPage } from "./pages/LoyaltyCustomerVisitsPage";
import { LoyaltyCustomerCouponsPage } from "./pages/LoyaltyCustomerCouponsPage";
import { clearLoyaltyCustomerSession, readLoyaltyCustomerSession } from "./customerSession";
import "./LoyaltyCustomerPortalPage.css";

const LoyaltyCustomerLayout = ({ children }: { children: ReactNode }) => {
  const profile = readLoyaltyCustomerSession();

  return (
    <main className="loyalty-customer-portal">
      <header>
        <h1>Fidelidad cliente</h1>
        <p>Experiencia cliente desacoplada (token, progreso de visitas y cupones).</p>
        {profile ? (
          <p>
            <strong>{profile.name}</strong> · #{profile.id}
            <button
              type="button"
              onClick={() => {
                clearLoyaltyCustomerSession();
                window.location.href = "/v2/loyalty/customer/token";
              }}
              style={{ marginLeft: "0.55rem" }}
            >
              Cerrar sesión
            </button>
          </p>
        ) : null}
      </header>

      <nav className="loyalty-customer-portal__tabs" aria-label="Navegación fidelidad cliente">
        <NavLink to="/v2/loyalty/customer/token">Token</NavLink>
        <NavLink to="/v2/loyalty/customer/visits">Visitas</NavLink>
        <NavLink to="/v2/loyalty/customer/coupons">Cupones</NavLink>
      </nav>

      {children}
    </main>
  );
};

export const LoyaltyCustomerRoutes = () => {
  return (
    <Routes>
      <Route
        path="token"
        element={(
          <LoyaltyCustomerLayout>
            <LoyaltyCustomerTokenPage />
          </LoyaltyCustomerLayout>
        )}
      />
      <Route
        path="visits"
        element={(
          <LoyaltyCustomerLayout>
            <LoyaltyCustomerVisitsPage />
          </LoyaltyCustomerLayout>
        )}
      />
      <Route
        path="coupons"
        element={(
          <LoyaltyCustomerLayout>
            <LoyaltyCustomerCouponsPage />
          </LoyaltyCustomerLayout>
        )}
      />
      <Route path="*" element={<Navigate to="token" replace />} />
    </Routes>
  );
};
