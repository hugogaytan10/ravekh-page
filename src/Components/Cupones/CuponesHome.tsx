import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import cuponsito from "../../assets/Cupones/cuponsito.png";
import { CuponesNav } from "./CuponesNav";
import { getCuponesUserName, hasCuponesSession } from "./cuponesSession";

const accentYellow = "#fbbc04";
const cardRed = "#c7222c";
const mutedRose = "#f3b7b7";
const textDark = "#303030";

const rewards = [
  { title: "Próxima recompensa", description: "10% de descuento en hamburguesa clasica" },
  { title: "Próxima recompensa", description: "10% de descuento en papas fritas" },
  { title: "Próxima recompensa", description: "2x1 en salchitacos" },
];

const CuponesHome: React.FC = () => {
  const navigate = useNavigate();
  const userName = getCuponesUserName();

  useEffect(() => {
    if (!hasCuponesSession()) {
      navigate("/cupones", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex justify-center px-4 pb-8">
      <div className="absolute top-[-80px] right-[-120px] w-[260px] h-[260px] bg-[#ffca1f] rounded-full opacity-70" />
      <div className="absolute bottom-[-120px] left-[-100px] w-[240px] h-[240px] bg-[#ffca1f] rounded-full opacity-70" />

      <div className="w-full max-w-[460px] relative">
        <header className="flex items-center gap-3 pt-8 px-1 text-[#414141]">
          <div className="h-14 w-14 rounded-full bg-[#fff2c2] border-2 border-[#ffd24c] flex items-center justify-center shadow-sm">
            <img src={cuponsito} alt="Avatar" className="h-10 w-10 object-contain" />
          </div>
          <div>
            <p className="text-sm font-semibold">Hola{userName ? ` ${userName}` : ""}</p>
            <p className="text-sm text-[#6a6a6a]">Buen día</p>
          </div>
        </header>

        <main className="mt-8 space-y-5">
          <section className="rounded-2xl px-5 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.15)] text-white bg-[#c0202b]">
            <div className="flex items-center justify-between">
              <p className="text-lg font-extrabold">Mis visitas</p>
              <span className="text-sm font-semibold">1/5</span>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((step) => (
                  <span
                    key={step}
                    className={`h-3 w-full rounded-full ${
                      step === 1 ? "bg-[#d0252e]" : "bg-white/55"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="mt-3 text-sm font-semibold">1/5</p>
          </section>

          <section
            className="rounded-2xl px-5 py-4 shadow-[0_12px_26px_rgba(0,0,0,0.2)] text-white"
            style={{ backgroundColor: cardRed }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-extrabold">Escanear cupón</p>
                <p className="text-sm text-white/80">Valida un QR con la cámara.</p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/cupones/admin/escanear")}
                className="rounded-full px-4 py-2 text-sm font-bold shadow-[0_8px_18px_rgba(0,0,0,0.18)]"
                style={{ backgroundColor: accentYellow, color: "#3e3e3e" }}
              >
                Escanear
              </button>
            </div>
          </section>        

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex flex-col items-center justify-center rounded-xl px-2 py-3 shadow-[0_10px_20px_rgba(0,0,0,0.14)]"
              style={{ backgroundColor: mutedRose, color: textDark }}
            >
              <img src={cuponsito} alt="Mis visitas" className="h-12 w-12 object-contain" />
              <span className="mt-2 font-bold text-sm">Mis visitas</span>
            </button>
            <button
              type="button"
              className="flex flex-col items-center justify-center rounded-xl px-2 py-3 shadow-[0_10px_20px_rgba(0,0,0,0.14)]"
              style={{ backgroundColor: mutedRose, color: textDark }}
              onClick={() => navigate("/cupones/cupones")}
            >
              <img src={cuponsito} alt="Mis cupones" className="h-12 w-12 object-contain" />
              <span className="mt-2 font-bold text-sm">Mis cupones</span>
            </button>
          </div>

          {/* {rewards.map((reward) => (
            <section
              key={reward.description}
              className="rounded-2xl px-5 py-4 shadow-[0_10px_22px_rgba(0,0,0,0.16)] text-white bg-[#c0202b] flex items-center gap-4"
            >
              <div className="h-12 w-12 rounded-lg border-2 border-white/80 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="h-7 w-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="4" y="5" width="16" height="14" rx="2.5" />
                  <path d="M12 5v14M4 10h3m10 0h3m-16 4h3m10 0h3" />
                </svg>
              </div>
              <div>
                <p className="text-base font-extrabold">{reward.title}</p>
                <p className="text-sm leading-snug">{reward.description}</p>
              </div>
            </section>
          ))} */}
        </main>

        <div className="mt-10">
          <CuponesNav active="inicio" />
        </div>
      </div>
    </div>
  );
};

export { CuponesHome };
export default CuponesHome;
