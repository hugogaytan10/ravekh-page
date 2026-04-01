import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import cuponsito from "../../../../../../assets/Cupones/cuponsito.png";
import { useCouponsTheme } from "../interface/useCouponsTheme";
import { redeemCouponByUser } from "../services/couponsApi";
import { getCuponesRole, getCuponesUserName, hasCuponesSession } from "../services/session";

const CouponWebRedeemPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme } = useCouponsTheme();
  const userName = getCuponesUserName();

  const couponId = useMemo(() => Number(searchParams.get("couponId")), [searchParams]);
  const userId = useMemo(() => Number(searchParams.get("userId")), [searchParams]);

  const isValidPayload = Number.isInteger(couponId) && couponId > 0 && Number.isInteger(userId) && userId > 0;
  const isAdmin = getCuponesRole().toUpperCase() === "ADMINISTRADOR";

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!hasCuponesSession()) {
      navigate("/login-punto-venta", {
        replace: true,
        state: { redirectTo: window.location.pathname + window.location.search }
      });
      return;
    }

    if (!isAdmin) {
      setStatus("error");
      setMessage("Solo un usuario con rol ADMINISTRADOR puede reclamar cupones desde la web.");
      return;
    }

    if (!isValidPayload) {
      setStatus("error");
      setMessage("El código QR para web no contiene un cupón válido.");
      return;
    }

    let isMounted = true;

    const redeem = async () => {
      setStatus("loading");
      setMessage("Procesando reclamo del cupón...");

      try {
        await redeemCouponByUser(couponId, userId);

        if (!isMounted) {
          return;
        }

        setStatus("success");
        setMessage("El cupón fue reclamado correctamente.");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setStatus("error");
        setMessage(error instanceof Error ? error.message : "No se pudo reclamar el cupón.");
      }
    };

    void redeem();

    return () => {
      isMounted = false;
    };
  }, [couponId, isAdmin, isValidPayload, navigate, userId]);

  return (
    <div
      className="min-h-screen relative overflow-hidden flex justify-center px-4 pb-36 transition-colors"
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
          <button
            type="button"
            onClick={() => navigate("/more")}
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
                Reclamo de cupón en web
              </p>
            </div>
          </div>
        </header>

        <main className="mt-8 relative space-y-5">
          <section
            className="rounded-2xl px-5 py-5 shadow-[0_14px_28px_rgba(0,0,0,0.22)] border"
            style={{ backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }}
          >
            <p className="text-base font-extrabold">Resultado del reclamo</p>
            <p
              className={`mt-3 text-sm font-semibold ${
                status === "success" ? "text-emerald-500" : status === "error" ? "text-red-500" : ""
              }`}
              style={status === "loading" ? { color: theme.textMuted } : undefined}
            >
              {message}
            </p>
          </section>
        </main>
      </div>
    </div>
  );
};

export { CouponWebRedeemPage };
export default CouponWebRedeemPage;
