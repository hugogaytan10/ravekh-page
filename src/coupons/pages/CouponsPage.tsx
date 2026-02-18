import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import cuponsito from "../../assets/Cupones/cuponsito.png";
import { CuponesNav } from "../interface/CouponsNav";
import { useCouponsTheme } from "../interface/useCouponsTheme";
import { getCuponesBusinessId, getCuponesUserId, getCuponesUserName, hasCuponesSession } from "../services/session";
import { claimCoupon, getClaimedCouponsByUser, getCouponsByBusiness, getCouponsDisponibilityByUser } from "../services/couponsApi";
import type { Coupon } from "../models/coupon";
import { toValidCoupons } from "../utils/couponValidation";

const TicketIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">  <rect x="4" y="5" width="16" height="14" rx="2.5" />
    <path d="M12 5v14M4 10h3m10 0h3m-16 4h3m10 0h3" />
  </svg>
);

const CouponsPage: React.FC = () => {
  const navigate = useNavigate();
  const userName = getCuponesUserName();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [claimedCoupons, setClaimedCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimLoadingId, setClaimLoadingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const userId = getCuponesUserId();
  const businessId = getCuponesBusinessId() ?? 1;
  const { theme } = useCouponsTheme();

  const fallbackCopy = useMemo(() => {
    if (!userId && !businessId) {
      return "Configura tu negocio para ver cupones disponibles.";
    }

    return "Aún no hay cupones disponibles para reclamar.";
  }, [businessId, userId]);

  useEffect(() => {
    if (!hasCuponesSession()) {
      navigate("/cupones", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    let isMounted = true;
    const fetchCoupons = async () => {
      setIsLoading(true);
      setErrorMessage("");
      setInfoMessage("");

      try {
        if (userId) {
          const [availableResponse, claimedResponse] = await Promise.all([
            getCouponsDisponibilityByUser(userId),
            getClaimedCouponsByUser(userId)
          ]);

          if (!isMounted) return;
          const safeClaimedCoupons = toValidCoupons(claimedResponse);
          const safeAvailableCoupons = toValidCoupons(availableResponse);
          const claimedIds = new Set(safeClaimedCoupons.map((coupon) => coupon.Id));

          setClaimedCoupons(safeClaimedCoupons);
          setCoupons(safeAvailableCoupons.filter((coupon) => !claimedIds.has(coupon.Id)));
        } else {
          const response = await getCouponsByBusiness(businessId);
          if (!isMounted) return;
          setCoupons(toValidCoupons(response));
          setClaimedCoupons([]);
        }
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(error instanceof Error ? error.message : "No se pudieron cargar los cupones.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCoupons();
    return () => {
      isMounted = false;
    };
  }, [businessId, userId]);

  const onClaimCoupon = async (coupon: Coupon) => {
    if (!userId) return;

    setClaimLoadingId(coupon.Id);
    setErrorMessage("");
    setInfoMessage("");

    try {
      await claimCoupon({ Coupon_Id: coupon.Id, User_Id: userId });
      setCoupons((prevCoupons) => prevCoupons.filter((currentCoupon) => currentCoupon.Id !== coupon.Id));
      setInfoMessage("Cupón reclamado correctamente. Ya lo puedes ver en Mis cupones.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo reclamar el cupón.");
    } finally {
      setClaimLoadingId(null);
    }
  };

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
          <div
            className="h-14 w-14 rounded-full border-2 flex items-center justify-center shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
            style={{ backgroundColor: theme.accent, borderColor: theme.accentSoft }}
          >
            <img src={cuponsito} alt="Avatar" className="h-10 w-10 object-contain" />
          </div>
          <div>
            <p className="text-sm font-semibold">Hola{userName ? ` ${userName}` : ""}</p>
            <p className="text-sm" style={{ color: theme.textMuted }}>
              Cupones disponibles para reclamar
            </p>
          </div>
        </header>

        <main className="mt-8 relative space-y-5">
          <div
            className="pointer-events-none absolute inset-x-[-32px] top-[130px] h-[120px] rounded-[38px] opacity-70 blur-[1px]"
            style={{ backgroundColor: theme.accent }}
          />

          {isLoading ? (
            <p className="text-sm font-semibold" style={{ color: theme.textMuted }}>
              Cargando cupones...
            </p>
          ) : null}

          {errorMessage ? (
            <p className="text-sm font-semibold text-red-500">{errorMessage}</p>
          ) : null}

          {infoMessage ? (
            <p className="text-sm font-semibold text-emerald-500">{infoMessage}</p>
          ) : null}

          {!isLoading && !errorMessage && coupons.length === 0 ? (
            <p className="text-sm font-semibold" style={{ color: theme.textMuted }}>
              {fallbackCopy}
            </p>
          ) : null}

          {
            coupons.length > 0 ?
          coupons.map((coupon, index) => (
            <section
              key={coupon.Id}
              className="relative rounded-2xl px-5 py-4 shadow-[0_14px_28px_rgba(0,0,0,0.22)] flex items-center gap-4 border"
              style={{ backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border, zIndex: 1 + index }}
            >
              <div
                className="h-16 w-16 rounded-xl border-2 flex items-center justify-center"
                style={{ borderColor: theme.border, color: theme.textMuted }}
              >
                <TicketIcon className="h-10 w-10" />
              </div>
              <div className="flex-1">
                <p className="text-base font-extrabold">Cupón disponible</p>
                <p className="text-sm leading-snug">{coupon.Description}</p>
                {userId ? (
                  <button
                    type="button"
                    className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold shadow-[0_6px_14px_rgba(0,0,0,0.18)]"
                    style={{ backgroundColor: theme.accent, color: theme.textPrimary }}
                    onClick={() => onClaimCoupon(coupon)}
                    disabled={claimLoadingId === coupon.Id}
                  >
                    {claimLoadingId === coupon.Id ? "Reclamando..." : "Reclamar cupón"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold shadow-[0_6px_14px_rgba(0,0,0,0.18)]"
                    style={{ backgroundColor: theme.accent, color: theme.textPrimary }}
                    onClick={() => navigate("/cupones/qr", { state: { coupon } })}
                  >
                    Mostrar QR
                  </button>
                )}
              </div>
            </section>
          )) : null
        }
        </main>

        <CuponesNav active="cupones" />
      </div>
    </div>
  );
};

export { CouponsPage };
export default CouponsPage;
