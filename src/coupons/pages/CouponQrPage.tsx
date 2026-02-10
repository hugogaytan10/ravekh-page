import React, { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import cuponsito from "../../assets/Cupones/cuponsito.png";
import { CuponesNav } from "../interface/CouponsNav";
import { useCouponsTheme } from "../interface/useCouponsTheme";
import { getCuponesUserName, hasCuponesSession } from "../services/session";
import type { Coupon } from "../models/coupon";

const CouponQrPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useCouponsTheme();
  const userName = getCuponesUserName();

  const coupon = useMemo(() => {
    const state = location.state as { coupon?: Coupon } | null;
    return (
      state?.coupon ?? {
        Id: 0,
        Business_Id: 1,
        QR: "QR-AB12C-9F4D",
        Description: "2x1 en salchitacos",
        Valid: "2025-12-31",
        LimitUsers: 1,
      }
    );
  }, [location.state]);

  const qrCells = useMemo(() => {
    const seed = coupon.QR.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return Array.from({ length: 81 }, (_, index) => {
      const x = index % 9;
      const y = Math.floor(index / 9);
      const isFinder = (x < 2 && y < 2) || (x > 6 && y < 2) || (x < 2 && y > 6);
      if (isFinder) return true;
      return (x * y + seed + index) % 3 === 0;
    });
  }, [coupon.QR]);

  useEffect(() => {
    if (!hasCuponesSession()) {
      navigate("/cupones", { replace: true });
    }
  }, [navigate]);

  return (
    <div
      className="min-h-screen relative overflow-hidden flex justify-center px-4 pb-32 transition-colors"
      style={{ backgroundColor: theme.background }}
    >
      <div
        className="absolute top-[-160px] right-[-200px] w-[380px] h-[380px] rounded-full opacity-80"
        style={{ backgroundColor: theme.accent }}
      />
      <div
        className="absolute bottom-[-220px] left-[-240px] w-[440px] h-[440px] rounded-full opacity-80"
        style={{ backgroundColor: theme.accent }}
      />

      <div className="relative w-full max-w-[460px] z-10">
        <header className="flex items-center gap-3 pt-8 px-1" style={{ color: theme.textPrimary }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="h-12 w-12 rounded-2xl border flex items-center justify-center shadow-[0_12px_24px_rgba(0,0,0,0.12)]"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          >
            <span className="text-lg">←</span>
          </button>
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-full border-2 flex items-center justify-center"
              style={{ backgroundColor: theme.accent, borderColor: theme.accentSoft }}
            >
              <img src={cuponsito} alt="Avatar" className="h-8 w-8 object-contain" />
            </div>
            <div>
              <p className="text-sm font-semibold">Hola{userName ? ` ${userName}` : ""}</p>
              <p className="text-sm" style={{ color: theme.textMuted }}>
                Presenta tu cupón
              </p>
            </div>
          </div>
        </header>

        <main className="mt-10 space-y-6">
          <section
            className="rounded-3xl px-6 py-6 shadow-[0_16px_32px_rgba(0,0,0,0.22)] border text-center"
            style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }}
          >
            <p className="text-lg font-extrabold">Este es tu QR</p>
            <p className="mt-2 text-sm" style={{ color: theme.textMuted }}>
              Muéstralo al administrador para escanear tu cupón.
            </p>

            <div
              className="mt-6 mx-auto w-56 rounded-3xl p-4 shadow-[0_10px_22px_rgba(0,0,0,0.12)]"
              style={{ backgroundColor: theme.surfaceElevated }}
            >
              <div className="grid grid-cols-9 gap-1">
                {qrCells.map((isActive, index) => (
                  <span
                    key={`qr-cell-${index}`}
                    className="block aspect-square rounded-[2px]"
                    style={{ backgroundColor: isActive ? theme.textPrimary : "transparent" }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-1 text-sm font-semibold" style={{ color: theme.textMuted }}>
              <p>Código: {coupon.QR}</p>
              <p>{coupon.Description}</p>
            </div>
          </section>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              className="w-full rounded-full px-4 py-3 text-sm font-bold shadow-[0_10px_22px_rgba(0,0,0,0.2)]"
              style={{ backgroundColor: theme.accent, color: theme.textPrimary }}
              onClick={() => navigate("/cupones/mis-cupones")}
            >
              Volver a mis cupones
            </button>
          </div>
        </main>

        <CuponesNav active="cupones" />
      </div>
    </div>
  );
};

export { CouponQrPage };
export default CouponQrPage;
