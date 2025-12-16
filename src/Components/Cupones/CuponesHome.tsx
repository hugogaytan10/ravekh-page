import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import papitas from "../../assets/Cupones/papitas.png";
import cuponsito from "../../assets/Cupones/cuponsito.png";
import { CuponesNav } from "./CuponesNav";
import { hasCuponesSession } from "./cuponesSession";

const accentYellow = "#f5b700";
const deepRed = "#d4252c";
const cardRed = "#b81b27";

const rewards = [
  { title: "Próxima recompensa", description: "10% de descuento en hamburguesa clasica" },
  { title: "Próxima recompensa", description: "10% de descuento en papas fritas" },
  { title: "Próxima recompensa", description: "2x1 en salchitacos" },
];

const CuponesHome: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasCuponesSession()) {
      navigate("/cupones", { replace: true });
    }
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex items-start justify-center px-4 py-10 relative"
      style={{ backgroundColor: deepRed }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[-90px] right-[-120px] w-[320px] h-[280px] rounded-[180px] opacity-90"
          style={{ backgroundColor: accentYellow }}
        ></div>
        <div
          className="absolute bottom-[-140px] left-[-120px] w-[400px] h-[260px] rounded-[160px] opacity-90"
          style={{ backgroundColor: accentYellow }}
        ></div>
      </div>

      <div className="relative w-full max-w-[380px] rounded-[32px]">
        <div className="flex items-center gap-3 px-2 text-white">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <img src={papitas} alt="Avatar" className="h-10 w-10 object-contain" />
          </div>
          <div>
            <p className="font-semibold">Hola Hugo</p>
            <p className="text-sm opacity-90">Buen día</p>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <div
            className="rounded-2xl px-4 py-4 shadow-lg text-white"
            style={{ backgroundColor: cardRed }}
          >
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold">Mis visitas</p>
              <span className="text-sm font-semibold">1/5</span>
            </div>
            <div className="mt-3 h-3 rounded-full bg-white/25">
              <div
                className="h-full rounded-full"
                style={{ width: "20%", backgroundColor: accentYellow }}
              ></div>
            </div>
          </div>

          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-4 shadow-lg"
            style={{ backgroundColor: cardRed }}
          >
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: accentYellow }}
            >
              <img src={cuponsito} alt="Ticket" className="h-6 w-6 object-contain" />
            </div>
            <div className="text-white">
              <p className="text-base font-semibold">Próxima recompensa</p>
              <p className="text-sm">10% de descuento en hamburguesa clasica</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex flex-col items-center justify-center rounded-2xl px-2 py-3 shadow-lg"
              style={{ backgroundColor: accentYellow }}
            >
              <img src={papitas} alt="Mis visitas" className="h-12 w-12 object-contain" />
              <span className="mt-1 font-semibold text-sm text-[#a11c25]">Mis visitas</span>
            </button>
            <button
              type="button"
              className="flex flex-col items-center justify-center rounded-2xl px-2 py-3 shadow-lg"
              style={{ backgroundColor: accentYellow }}
            >
              <img src={cuponsito} alt="Mis cupones" className="h-12 w-12 object-contain" />
              <span className="mt-1 font-semibold text-sm text-[#a11c25]">Mis cupones</span>
            </button>
          </div>

          {rewards.slice(1).map((reward) => (
            <div
              key={reward.description}
              className="flex items-center gap-3 rounded-2xl px-4 py-4 shadow-lg"
              style={{ backgroundColor: cardRed }}
            >
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: accentYellow }}
              >
                <img src={cuponsito} alt="Ticket" className="h-6 w-6 object-contain" />
              </div>
              <div className="text-white">
                <p className="text-base font-semibold">{reward.title}</p>
                <p className="text-sm">{reward.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <CuponesNav active="inicio" />
        </div>
      </div>
    </div>
  );
};

export { CuponesHome };
export default CuponesHome;
