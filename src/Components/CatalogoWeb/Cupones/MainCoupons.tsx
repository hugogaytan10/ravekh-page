import React, { useContext, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { AppContext } from "../Context/AppContext";
import { ThemeLight } from "../PuntoVenta/Theme/Theme";

const tabs = [
  { label: "Visitas", to: "/cuponespv/visitas" },
  { label: "Cupones", to: "/cuponespv/cupones" },
];

export const MainCoupons: React.FC = () => {
  const context = useContext(AppContext);
  const location = useLocation();

  const accentColor = context.store?.Color ?? ThemeLight.btnBackground;
  const hideMainCouponsTabs =
    (location.state as { hideMainCouponsTabs?: boolean } | null)?.hideMainCouponsTabs === true;

  useEffect(() => {
    if (typeof context.setShowNavBarBottom === "function") {
      context.setShowNavBarBottom(false);
    }

    return () => {
      if (typeof context.setShowNavBarBottom === "function") {
        context.setShowNavBarBottom(true);
      }
    };
  }, [context]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: ThemeLight.backgrounColor }}>
      {!hideMainCouponsTabs && (
        <div className="border-b border-gray-200 bg-white px-4 pt-4">
          <nav className="flex gap-6">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className="pb-3 text-[12px] font-semibold"
                style={({ isActive }) => ({
                  color: isActive ? accentColor : "#888888",
                  borderBottom: `2px solid ${isActive ? accentColor : "transparent"}`,
                })}
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      <div className="p-4">
        <Outlet />
      </div>
    </div>
  );
};
