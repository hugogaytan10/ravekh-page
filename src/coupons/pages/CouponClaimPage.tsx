import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import cuponsito from "../../assets/Cupones/cuponsito.png";
import { CuponesNav } from "../interface/CouponsNav";
import { useCouponsTheme } from "../interface/useCouponsTheme";
import type { Coupon } from "../models/coupon";
import { claimCoupon, getCouponById } from "../services/couponsApi";
import {
  clearPendingCouponClaimId,
  getCuponesUserId,
  getCuponesUserName,
  hasCuponesSession,
  setPendingCouponClaimId,
} from "../services/session";

const TicketIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="4" y="5" width="16" height="14" rx="2.5" />
    <path d="M12 5v14M4 10h3m10 0h3m-16 4h3m10 0h3" />
  </svg>
);

const CouponClaimPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { couponId } = useParams<{ couponId: string }>();
  const { theme } = useCouponsTheme();
  const userName = getCuponesUserName();
  const userId = getCuponesUserId();

  const parsedCouponId = useMemo(() => Number(couponId), [couponId]);
  const isValidCouponId = Number.isInteger(parsedCouponId) && parsedCouponId > 0;
  const autoClaimEnabled = useMemo(() => new URLSearchParams(location.search).get("autoclaim") === "1", [location.search]);

  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchCoupon = async () => {
      if (!isValidCouponId) {
        setErrorMessage("El cupón no es válido.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const currentCoupon = await getCouponById(parsedCouponId);

        if (!isMounted) {
          return;
        }

        if (!currentCoupon) {
          setErrorMessage("No encontramos el cupón solicitado.");
          setCoupon(null);
          return;
        }

        setCoupon(currentCoupon);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : "No se pudo cargar el cupón.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchCoupon();

    return () => {
      isMounted = false;
    };
  }, [isValidCouponId, parsedCouponId]);

  const onClaimCoupon = async () => {
    if (!coupon || !userId || isClaiming) {
      return;
    }

    setIsClaiming(true);
    setErrorMessage("");

    try {
      await claimCoupon({ Coupon_Id: coupon.Id, User_Id: userId });
      clearPendingCouponClaimId();
      navigate("/cupones/nuevo", {
        replace: true,
        state: {
          title: "¡Felicidades!",
          message: "Has canjeado tu cupón exitosamente.",
          primaryLabel: "Ver mis cupones",
          primaryTo: "/cupones/mis-cupones",
          secondaryLabel: "Ir al inicio",
          secondaryTo: "/cupones/home",
        },
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo reclamar el cupón.");
    } finally {
      setIsClaiming(false);
    }
  };

  useEffect(() => {
    if (!autoClaimEnabled || !coupon || !userId || isLoading || isClaiming) {
      return;
    }

    void onClaimCoupon();
  }, [autoClaimEnabled, coupon, userId, isLoading]);

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
            onClick={() => navigate("/cupones/cupones")}
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
                Reclama tu cupón
              </p>
            </div>
          </div>
        </header>

        <main className="mt-8 relative space-y-5">
          <section
            className="rounded-2xl px-5 py-5 shadow-[0_14px_28px_rgba(0,0,0,0.22)] border"
            style={{ backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }}
          >
            {isLoading ? <p className="text-sm font-semibold">Cargando cupón...</p> : null}

            {errorMessage ? <p className="text-sm font-semibold text-red-500">{errorMessage}</p> : null}

            {!isLoading && !errorMessage && coupon ? (
              <div className="flex items-center gap-4">
                <div
                  className="h-16 w-16 rounded-xl border-2 flex items-center justify-center"
                  style={{ borderColor: theme.border, color: theme.textMuted }}
                >
                  <TicketIcon className="h-10 w-10" />
                </div>

                <div className="flex-1">
                  <p className="text-base font-extrabold">Cupón disponible</p>
                  <p className="text-sm leading-snug">{coupon.Description}</p>

                  {!hasCuponesSession() ? (
                    <button
                      type="button"
                      className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold shadow-[0_6px_14px_rgba(0,0,0,0.18)]"
                      style={{ backgroundColor: theme.accent, color: theme.textPrimary }}
                      onClick={() => {
                        setPendingCouponClaimId(coupon.Id);
                        navigate(`/cupones?couponId=${coupon.Id}`);
                      }}
                    >
                      Inicia sesión para reclamar
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold shadow-[0_6px_14px_rgba(0,0,0,0.18)]"
                      style={{ backgroundColor: theme.accent, color: theme.textPrimary }}
                      onClick={() => {
                        void onClaimCoupon();
                      }}
                      disabled={isClaiming}
                    >
                      {isClaiming ? "Reclamando..." : "Reclamar cupón"}
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </section>
        </main>

        <CuponesNav active="cupones" />
      </div>
    </div>
  );
};

export { CouponClaimPage };
export default CouponClaimPage;
