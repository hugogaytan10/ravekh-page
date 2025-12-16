import React from "react";
import { useNavigate } from "react-router-dom";
import cuponsito from "../../assets/Cupones/cuponsito.png";
import tiendita from "../../assets/Cupones/tiendita.png";
import cuenta from "../../assets/Cupones/cuenta.png";

const accentYellow = "#fbbc04";
const navGray = "#4a4a4a";

type CuponesNavKey = "inicio" | "cupones" | "ajustes";

interface CuponesNavProps {
  active: CuponesNavKey;
}

const CuponesNav: React.FC<CuponesNavProps> = ({ active }) => {
  const navigate = useNavigate();

  const navItems: { key: CuponesNavKey; label: string; icon: string; path: string }[] = [
    { key: "inicio", label: "Inicio", icon: tiendita, path: "/cupones/home" },
    { key: "cupones", label: "Cupones", icon: cuponsito, path: "/cupones/cupones" },
    { key: "ajustes", label: "Configurar", icon: cuenta, path: "/cupones/ajustes" },
  ];

  return (
    <div className="px-4 pb-8 pt-4">
      <div className="mx-auto w-full max-w-[560px]">
        <div className="relative rounded-full bg-[#3e3e3e] shadow-[0_10px_24px_rgba(0,0,0,0.28)] px-3 py-3 flex items-center gap-3">
          {navItems.map((item) => {
            const isActive = active === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(item.path)}
                className={`flex-1 min-h-[72px] flex flex-col items-center justify-center gap-1 transition-all duration-200 rounded-full px-3 py-2 ${
                  isActive ? "bg-[#fbbc04]" : "bg-transparent"
                }`}
                style={{ color: isActive ? "#3e3e3e" : "#e3e3e3" }}
              >
                <span
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full border ${
                    isActive ? "bg-white border-transparent" : "border-white/40"
                  }`}
                >
                  <img src={item.icon} alt={item.label} className="h-6 w-6 object-contain" />
                </span>
                <span className="font-semibold text-xs leading-tight text-center">{item.label}</span>
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
