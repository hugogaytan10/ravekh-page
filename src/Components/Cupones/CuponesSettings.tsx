import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import papitas from "../../assets/Cupones/papitas.png";
import { CuponesNav } from "./CuponesNav";
import { hasCuponesSession } from "./cuponesSession";

const accentYellow = "#f5b700";
const deepRed = "#d4252c";
const cardRed = "#b81b27";

const CuponesSettings: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasCuponesSession()) {
      navigate("/cupones", { replace: true });
    }
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex items-start justify-center px-4 py-10 relative overflow-hidden"
      style={{ backgroundColor: deepRed }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[-70px] right-[-80px] w-[260px] h-[260px] rounded-full opacity-90"
          style={{ backgroundColor: accentYellow }}
        ></div>
        <div
          className="absolute bottom-[-100px] left-[-60px] w-[320px] h-[240px] rounded-[140px] opacity-90"
          style={{ backgroundColor: accentYellow }}
        ></div>
      </div>

      <div className="relative w-full max-w-[380px] rounded-[32px] overflow-hidden">
        <div className="flex items-center gap-3 px-2 text-white">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <img src={papitas} alt="Avatar" className="h-10 w-10 object-contain" />
          </div>
          <div>
            <p className="font-semibold">Hola Hugo</p>
            <p className="text-sm opacity-90">Buen día</p>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          {["Cambiar nombre", "Eliminar cuenta"].map((label) => (
            <button
              key={label}
              type="button"
              className="w-full flex items-center justify-between px-4 py-4 rounded-2xl text-white text-base font-semibold shadow-lg"
              style={{ backgroundColor: cardRed }}
            >
              <span>{label}</span>
              <span className="text-xl">›</span>
            </button>
          ))}
        </div>

        <p className="text-center text-white mt-10">Hecho por Ravekh &lt;3</p>

        <div className="mt-6">
          <CuponesNav active="ajustes" />
        </div>
      </div>
    </div>
  );
};

export { CuponesSettings };
export default CuponesSettings;
