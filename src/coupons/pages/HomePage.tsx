import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import cuponsito from "../../assets/Cupones/cuponsito.png";
import { CuponesNav } from "../interface/CouponsNav";
import { useCouponsTheme } from "../interface/useCouponsTheme";
import { getCuponesUserId, getCuponesUserName, hasCuponesSession } from "../services/session";
import { Visits } from "../models/coupon";
import { getVisitsByUserId } from "../services/visitsApi";
const rewards = [
  { title: "Próxima recompensa", description: "10% de descuento en hamburguesa clasica" },
  { title: "Próxima recompensa", description: "10% de descuento en papas fritas" },
  { title: "Próxima recompensa", description: "2x1 en salchitacos" },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const userName = getCuponesUserName();
  const { theme } = useCouponsTheme();
  const [visits, setVisits] = useState<Visits[]>([]);

  useEffect(() => {
    if (!hasCuponesSession()) {
      navigate("/cupones", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    //hacemos la peticion de las visitas por usuario y seteamos el estado
    const fetchVisits = async () => {
      try {
        const userId = getCuponesUserId();
        if (userId) {
          const visitsData: Visits[] = await getVisitsByUserId(userId);
          setVisits(visitsData);
          console.log("Visitas cargadas:", visitsData);
        }
      } catch (error) {
        console.error("Error al cargar las visitas:", error);
      }
    }
    fetchVisits();
  }, []);

  return (
    <div
      className="min-h-screen relative overflow-hidden flex justify-center px-4 pb-36 transition-colors"
      style={{ backgroundColor: theme.background }}
    >
      <div
        className="absolute top-[-120px] right-[-160px] w-[320px] h-[320px] rounded-full opacity-80"
        style={{ backgroundColor: theme.accent }}
      />
      <div
        className="absolute bottom-[-160px] left-[-140px] w-[300px] h-[300px] rounded-full opacity-80"
        style={{ backgroundColor: theme.accent }}
      />

      <div className="w-full max-w-[460px] relative z-10">
        <header className="flex items-center gap-3 pt-8 px-1" style={{ color: theme.textPrimary }}>
          <div
            className="h-14 w-14 rounded-full border-2 flex items-center justify-center shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
            style={{ backgroundColor: theme.accent, borderColor: theme.accentSoft }}
          >
            <img src={cuponsito} alt="Avatar" className="h-10 w-10 object-contain" />
          </div>
          <div>
            <p className="text-sm font-semibold">Hola{userName ? ` ${userName}` : ""}</p>
            <p className="text-sm" style={{ color: theme.textMuted }}>
              Buen día
            </p>
          </div>
        </header>

        <main className="mt-8 space-y-5">
          {
            /*
               <section
            className="rounded-2xl px-5 py-4 shadow-[0_14px_28px_rgba(0,0,0,0.2)] border"
            style={{ backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }}
          >            <div className="flex items-center justify-between">
              <p className="text-lg font-extrabold">Mis visitas</p>
              <span className="text-sm font-semibold">1/5</span>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((step) => (
                  <span
                    key={step}
                    className="h-3 w-full rounded-full"
                    style={{
                      backgroundColor: step === 1 ? theme.accent : theme.surfaceElevated,
                    }}
                  />
                ))}
              </div>
            </div>
            <p className="mt-3 text-sm font-semibold">1/5</p>
          </section>
            */
          }
          {
            visits &&
            visits.length > 0 && (
              visits.map((visit) => (
                <section
                  className="rounded-2xl px-5 py-4 shadow-[0_14px_28px_rgba(0,0,0,0.2)] border"
                  style={{ backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }}
                >            <div className="flex items-center justify-between">
                    <p className="text-lg font-extrabold">Mis visitas en {visit.BusinessName}</p>
                    <span className="text-sm font-semibold">{visit.VisitCount}/{visit.MinVisits}</span>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-2">
                      {Array.from({ length: visit.MinVisits }, (_, index) => index + 1).map((step) => (
                        <span
                          key={step}
                          className="h-3 w-full rounded-full"
                          style={{
                            backgroundColor: step <= (visit.VisitCount ?? 0) ? theme.accent : theme.surfaceElevated,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-semibold">
                    {visit.VisitCount}/{visit.MinVisits} visitas
                  </p>
                </section>
              ))
            )
          }


          <section
            className="rounded-2xl px-5 py-4 shadow-[0_16px_32px_rgba(0,0,0,0.22)] border"
            style={{ backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-extrabold">Escanear cupón</p>
                <p className="text-sm" style={{ color: theme.textMuted }}>
                  Valida un QR con la cámara.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/cupones/admin/escanear")}
                className="rounded-full px-4 py-2 text-sm font-bold shadow-[0_10px_22px_rgba(0,0,0,0.2)]"
                style={{ backgroundColor: theme.accent, color: theme.textPrimary }}>
                Escanear
              </button>
            </div>
          </section>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex flex-col items-center justify-center rounded-xl px-2 py-3 shadow-[0_12px_24px_rgba(0,0,0,0.2)] border"
              style={{ backgroundColor: theme.accent, color: theme.textPrimary, borderColor: theme.border }}
              onClick={() => navigate("/cupones/visitas")}
            >
              <img src={cuponsito} alt="Mis visitas" className="h-12 w-12 object-contain" />
              <span className="mt-2 font-bold text-sm">Mis visitas</span>
            </button>
            <button
              type="button"
              className="flex flex-col items-center justify-center rounded-xl px-2 py-3 shadow-[0_12px_24px_rgba(0,0,0,0.2)] border"
              style={{ backgroundColor: theme.accent, color: theme.textPrimary, borderColor: theme.border }}
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

        <CuponesNav active="inicio" />
      </div>
    </div>
  );
};

export { HomePage };
export default HomePage;

