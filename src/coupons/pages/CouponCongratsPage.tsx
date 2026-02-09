import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import cuponsito from "../../assets/Cupones/cuponsito.png";
import { useCouponsTheme } from "../interface/useCouponsTheme";
import { hasCuponesSession } from "../services/session";

const CouponCongratsPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useCouponsTheme();

  useEffect(() => {
    if (!hasCuponesSession()) {
      navigate("/cupones", { replace: true });
    }
  }, [navigate]);

  return (
    <div
      className="min-h-screen relative overflow-hidden flex justify-center px-4 pb-16 transition-colors"
      style={{ backgroundColor: theme.background }}
    >
      <div
        className="absolute top-[-180px] right-[-180px] w-[320px] h-[320px] rounded-full opacity-80"
        style={{ backgroundColor: theme.accent }}
      />
      <div
        className="absolute bottom-[-200px] left-[-200px] w-[360px] h-[360px] rounded-full opacity-80"
        style={{ backgroundColor: theme.accent }}
      />

      <div className="relative w-full max-w-[420px] z-10">
        <header className="flex items-center gap-3 pt-8 px-1" style={{ color: theme.textPrimary }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="h-12 w-12 rounded-2xl border flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.12)]"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          >
            <span className="text-lg">←</span>
          </button>
        </header>

        <main className="mt-6 flex flex-col items-center text-center">
          <h1 className="text-3xl font-extrabold" style={{ color: theme.textPrimary }}>
            Felicidades
          </h1>
          <p className="mt-3 text-sm" style={{ color: theme.textMuted }}>
            Has obtenido un nuevo cupón
          </p>

          <div className="mt-10">
            <img src={cuponsito} alt="Cupón recibido" className="w-52 drop-shadow-xl" />
          </div>

          <div className="mt-12 w-full flex flex-col items-center gap-3">
            <button
              type="button"
              className="w-full rounded-full px-4 py-3 text-sm font-bold shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
              style={{ backgroundColor: theme.accent, color: theme.textPrimary }}
              onClick={() => navigate("/cupones/home")}
            >
              Continuar acumulando
            </button>
            <button
              type="button"
              className="text-sm font-semibold"
              style={{ color: theme.textMuted }}
              onClick={() => navigate("/cupones/qr")}
            >
              Ver mi QR
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export { CouponCongratsPage };
export default CouponCongratsPage;
