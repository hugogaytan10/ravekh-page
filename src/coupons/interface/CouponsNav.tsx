import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCouponsTheme } from "./useCouponsTheme";
import homeIcon from "../../assets/Cupones/home.svg";
import couponIcon from "../../assets/Cupones/coupon.svg";
import settingsIcon from "../../assets/Cupones/settings.svg";

type CuponesNavKey = "inicio" | "cupones" | "ajustes";
interface CuponesNavProps { active: CuponesNavKey; }

const whiteIconFilter = "brightness(0) invert(1)";
const ACTIVE_PILL_W = 110;
const ANIM_MS = 220;


const indexByKey: Record<CuponesNavKey, number> = {
  inicio: 0,
  cupones: 1,
  ajustes: 2,
};

const CuponesNav: React.FC<CuponesNavProps> = ({ active }) => {
  const navigate = useNavigate();
  const { theme } = useCouponsTheme();

  const navItems = useMemo(
    () => [
      { key: "inicio" as const, label: "Inicio", icon: homeIcon, path: "/cupones/home" },
      { key: "cupones" as const, label: "Cupones", icon: couponIcon, path: "/cupones/cupones" },
      { key: "ajustes" as const, label: "Ajustes", icon: settingsIcon, path: "/cupones/ajustes" },
    ],
    []
  );

  // estado visual del pill (para animar al click)
  const [visualKey, setVisualKey] = useState<CuponesNavKey>(active);
  const pendingTimeout = useRef<number | null>(null);

  // si cambias de ruta por cualquier otra razón, sincroniza
  useEffect(() => {
    setVisualKey(active);
  }, [active]);

  useEffect(() => {
    return () => {
      if (pendingTimeout.current) window.clearTimeout(pendingTimeout.current);
    };
  }, []);

  const visualIndex = indexByKey[visualKey];
  const visualItem = navItems[visualIndex];

  // posiciones por slot (izq/centro/der) dentro del nav
  const pillLeft = visualIndex === 0 ? "16.666%" : visualIndex === 1 ? "50%" : "83.333%";

  const onItemClick = (key: CuponesNavKey, path: string) => {
    if (key === active) return;

    // 1) mueve el pill (animación)
    setVisualKey(key);

    // 2) navega después de que se vea la animación
    if (pendingTimeout.current) window.clearTimeout(pendingTimeout.current);
    pendingTimeout.current = window.setTimeout(() => {
      navigate(path);
    }, ANIM_MS);
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 px-4"
      style={{ paddingBottom: `calc(16px + env(safe-area-inset-bottom))` }}
    >
      {/* gradiente detrás */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-28"
        aria-hidden="true"
        style={{
          background: `linear-gradient(to top, ${theme.background} 0%, rgba(0,0,0,0) 70%)`,
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[520px] overflow-visible">
        <nav
          className="
            relative grid grid-cols-3 items-center rounded-full border py-3
            shadow-[0_18px_40px_rgba(0,0,0,0.35)]
            overflow-hidden
          "
          style={{
            backgroundColor: theme.nav,
            borderColor: theme.border,
            paddingLeft: 18,
            paddingRight: 18,
          }}
          aria-label="Navegación de cupones"
        >
          {/* PILL ANIMADO (NO se sale porque el nav tiene overflow-hidden) */}
          <div
            className="pointer-events-none absolute top-1/2 z-0 transition-all duration-200"
            style={{
              left: pillLeft,
              transform: "translate(-50%, -50%)",
              width: ACTIVE_PILL_W,
              transitionDuration: `${ANIM_MS}ms`,
              transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <div
              className="flex items-center justify-center gap-2 rounded-full px-4 py-2 shadow-[0_10px_22px_rgba(0,0,0,0.25)]"
              style={{ backgroundColor: theme.accent, color: theme.textPrimary }}
            >
              <img
                src={visualItem.icon}
                alt=""
                aria-hidden="true"
                className="h-6 w-6 object-contain flex-shrink-0"
                style={{ filter: whiteIconFilter }}
              />
              <span
                key={visualItem.key}
                className="text-sm font-semibold leading-none truncate"
              >
                {visualItem.label}
              </span>
            </div>
          </div>

          {/* ITEMS clickeables (encima) */}
          {navItems.map((item, index) => {
            const isVisuallyActive = visualKey === item.key;
            const justify = index === 0 ? "justify-start" : index === 1 ? "justify-center" : "justify-end";
            const edgePad = index === 0 ? "pl-2" : index === 2 ? "pr-2" : "";

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onItemClick(item.key, item.path)}
                aria-current={active === item.key ? "page" : undefined}
                className={`relative z-10 flex items-center ${justify} ${edgePad} select-none`}
              >
                {/* para que no se duplique icono con el pill */}
                <img
                  src={item.icon}
                  alt={item.label}
                  className={`h-7 w-7 object-contain transition-all duration-150 ${
                    isVisuallyActive ? "opacity-0 scale-95" : "opacity-95 active:scale-95"
                  }`}
                  style={{ filter: whiteIconFilter }}
                />
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export { CuponesNav };
export type { CuponesNavKey };
