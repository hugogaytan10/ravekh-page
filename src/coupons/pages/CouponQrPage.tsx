import React, { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import cuponsito from "../../assets/Cupones/cuponsito.png";
import QRCode from "../lib/QRCode";
import QRErrorCorrectLevel from "../lib/QRCode/QRErrorCorrectLevel";
import { CuponesNav } from "../interface/CouponsNav";
import { useCouponsTheme } from "../interface/useCouponsTheme";
import { getCuponesUserId, getCuponesUserName, hasCuponesSession } from "../services/session";
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

  const userId = getCuponesUserId();

  const qrPayload = useMemo(
    () => JSON.stringify({ Code: coupon.QR, UserId: userId }),
    [coupon.QR, userId]
  );

  const qrUrl = useMemo(() => {
    const qr = new QRCode(0, QRErrorCorrectLevel.M);
    qr.addData(qrPayload);
    qr.make();

    const moduleCount = qr.getModuleCount();
    const size = 256;
    const margin = 16;
    const moduleSize = (size - margin * 2) / moduleCount;
    const rects: string[] = [];

    for (let row = 0; row < moduleCount; row += 1) {
      for (let col = 0; col < moduleCount; col += 1) {
        if (qr.isDark(row, col)) {
          const x = (margin + col * moduleSize).toFixed(4);
          const y = (margin + row * moduleSize).toFixed(4);
          const w = moduleSize.toFixed(4);
          rects.push(`<rect x="${x}" y="${y}" width="${w}" height="${w}" fill="#111827" />`);
        }
      }
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="100%" height="100%" fill="#ffffff"/>${rects.join("")}</svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }, [qrPayload]);

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
              style={{ backgroundColor: "#ffffff" }}
            >
              <img src={qrUrl} alt="Código QR del cupón" className="w-full h-auto rounded-xl" loading="lazy" />
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
