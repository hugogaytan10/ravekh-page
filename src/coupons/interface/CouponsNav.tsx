import React from "react";
import { useNavigate } from "react-router-dom";
import { useCouponsTheme } from "./useCouponsTheme";
import homeIcon from "../../assets/Cupones/home.svg";
import couponIcon from "../../assets/Cupones/coupon.svg";
import settingsIcon from "../../assets/Cupones/settings.svg"; 
type CuponesNavKey = "inicio" | "cupones" | "ajustes";

interface CuponesNavProps {   
  active: CuponesNavKey;
}

const CuponesNav: React.FC<CuponesNavProps> = ({ active }) => {
  const navigate = useNavigate();
  const { theme } = useCouponsTheme();
  const navItems: { key: CuponesNavKey; label: string; icon: string; path: string }[] = [
    { key: "inicio", label: "Inicio", icon: homeIcon, path: "/cupones/home" },
    { key: "cupones", label: "Cupones", icon: couponIcon, path: "/cupones/cupones" },
    { key: "ajustes", label: "Configurar", icon: settingsIcon, path: "/cupones/ajustes" },
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-6 pt-3">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t to-transparent"
        style={{ backgroundImage: `linear-gradient(to top, ${theme.background}, transparent)` }}
        aria-hidden="true"
      />
      <div className="relative mx-auto w-full max-w-[560px]">
        <div
          className="relative rounded-full border shadow-[0_18px_40px_rgba(0,0,0,0.35)] px-4 py-3 flex items-center justify-between gap-3"
          style={{ backgroundColor: theme.nav, borderColor: theme.border }}
        >
          {navItems.map((item) => {
            const isActive = active === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(item.path)}
                aria-current={isActive ? "page" : undefined}
                className="flex-1 flex items-center justify-center transition-all duration-200"
              >
                {isActive ? (
                  <span
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 shadow-[0_10px_22px_rgba(0,0,0,0.25)]"
                    style={{ backgroundColor: theme.accent, color: theme.textPrimary }}
                  >
                    <img src={item.icon} alt={item.label} className="h-7 w-7 object-contain" />
                    <span className="text-sm font-semibold">{item.label}</span>
                  </span>
                ) : (
                  <span
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full border"
                    style={{ borderColor: theme.border }}
                  >
                    <img src={item.icon} alt={item.label} className="h-7 w-7 object-contain opacity-80" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export { CuponesNav };
export type { CuponesNavKey };
