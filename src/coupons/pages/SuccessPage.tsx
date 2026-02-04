import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import cuponsito from "../../assets/Cupones/cuponsito.png";
import { CuponesNav } from "../interface/CouponsNav";
import { useCouponsTheme } from "../interface/useCouponsTheme";
import { getCuponesUserName, hasCuponesSession } from "../services/session";

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const userName = getCuponesUserName();
  const { theme } = useCouponsTheme();

  useEffect(() => {
    if (!hasCuponesSession()) {
      navigate("/cupones", { replace: true });
    }
  }, [navigate]);

  return (
    <div
      className="min-h-screen relative overflow-hidden flex justify-center px-4 pb-28 transition-colors"
      style={{ backgroundColor: theme.background }}
    >
      <div
        className="absolute top-[-160px] right-[-200px] w-[380px] h-[380px] rounded-full opacity-80"
        style={{ backgroundColor: theme.accent }}
      />
      <div
        className="absolute bottom-[-200px] left-[-220px] w-[420px] h-[420px] rounded-full opacity-80"
        style={{ backgroundColor: theme.accent }}
      />

      <div className="relative w-full max-w-[460px] z-10">
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
              Cupón confirmado
            </p>
          </div>
        </header>

        <main className="mt-10 space-y-5">
          <section
            className="rounded-2xl px-6 py-6 shadow-[0_16px_32px_rgba(0,0,0,0.22)] text-center border"
            style={{ backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }}
          >
            <div
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full"
              style={{ backgroundColor: theme.surfaceElevated }}
            >
              <span className="text-3xl">✅</span>
            </div>
            <p className="mt-4 text-xl font-extrabold">Venta completada</p>
            <p className="mt-2 text-sm" style={{ color: theme.textMuted }}>
              El cupón se aplicó correctamente y quedó registrado.
            </p>
          </section>

          <section
            className="rounded-2xl px-5 py-4 shadow-[0_16px_32px_rgba(0,0,0,0.22)] border"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold" style={{ color: theme.textPrimary }}>
                Detalle del canje
              </p>
              <span className="text-xs font-semibold" style={{ color: theme.textMuted }}>
                #A-0091
              </span>
            </div>
            <div className="mt-3 space-y-2 text-sm font-semibold" style={{ color: theme.textMuted }}>
              <p>QR: QR-AB12C-9F4D</p>
              <p>Cupón: 2x1 en salchitacos</p>
              <p>Redención: 1 usuario</p>
            </div>
          </section>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              className="w-full rounded-full px-4 py-3 text-sm font-bold shadow-[0_10px_22px_rgba(0,0,0,0.2)]"
              style={{ backgroundColor: theme.accent, color: theme.textPrimary }}
              onClick={() => navigate("/cupones/admin/escanear")}
            >
              Escanear otro cupón
            </button>
            <button
              type="button"
              className="w-full rounded-full border px-4 py-3 text-sm font-bold"
              style={{ borderColor: theme.border, backgroundColor: theme.surfaceElevated, color: theme.textPrimary }}
              onClick={() => navigate("/cupones/admin")}
            >
              Volver al panel
            </button>
          </div>
        </main>

        <CuponesNav active="ajustes" />
      </div>
    </div>
  );
};

export { SuccessPage };
export default SuccessPage;