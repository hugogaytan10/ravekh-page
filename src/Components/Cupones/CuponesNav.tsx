import React from "react";
import { useNavigate } from "react-router-dom";
import cuponsito from "../../assets/Cupones/cuponsito.png";
import tiendita from "../../assets/Cupones/tiendita.png";
import cuenta from "../../assets/Cupones/cuenta.png";
const cardRed = "#b81b27";

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
      <div className="mx-auto w-full max-w-[440px]">
        <div className="relative rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.18)] px-2 py-2 flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = active === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(item.path)}
                className={`flex-1 min-h-[60px] flex items-center justify-center gap-2 transition-all duration-200 rounded-full px-3 py-2 ${
                  isActive ? "bg-[#f5b700] shadow-md" : "bg-white"
                }`}
                style={{ color: isActive ? cardRed : "#8a6d57" }}
              >
                <span
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full border ${
                    isActive ? "bg-white border-transparent" : "bg-[#fff5da] border-[#f5b700]"
                  }`}
                >
                  <img src={item.icon} alt={item.label} className="h-6 w-6 object-contain" />
                </span>
                <span className="font-semibold text-sm leading-tight">{item.label}</span>
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
