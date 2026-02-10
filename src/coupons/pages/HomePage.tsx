import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import cuponsito from "../../assets/Cupones/cuponsito.png";
import { CuponesNav } from "../interface/CouponsNav";
import { useCouponsTheme } from "../interface/useCouponsTheme";
import { getCuponesUserId, getCuponesUserName, hasCuponesSession } from "../services/session";
import type { Visits } from "../models/coupon";
import { CouponsPageHeader } from "../components/CouponsPageHeader";
import { toValidVisits } from "../utils/visitValidation";
import { getVisitsByUserId } from "../services/visitsApi";
import { getClaimedCouponsByUser } from "../services/couponsApi";
import type { Coupon } from "../models/coupon";
import { toValidCoupons } from "../utils/couponValidation";

type HomeView = "overview" | "myCoupons";


const TicketIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="4" y="5" width="16" height="14" rx="2.5" />
    <path d="M12 5v14M4 10h3m10 0h3m-16 4h3m10 0h3" />
  </svg>
);


const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const userName = getCuponesUserName();
  const { theme } = useCouponsTheme();
  const [visits, setVisits] = useState<Visits[]>([]);
  const [visitsError, setVisitsError] = useState<string>("");
  const [activeView, setActiveView] = useState<HomeView>("overview");

  const [isLoadingCoupons, setIsLoadingCoupons] = useState<boolean>(false);
  const [claimedCoupons, setClaimedCoupons] = useState<Coupon[]>([]);
  const [claimedCouponsError, setClaimedCouponsError] = useState<string>("");

  const userId = useMemo<number | null>(() => {
    const currentUserId = getCuponesUserId();
    return typeof currentUserId === "number" && Number.isFinite(currentUserId) ? currentUserId : null;
  }, []);

  useEffect(() => {
    if (!hasCuponesSession()) {
      navigate("/cupones", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const fetchVisits = async (): Promise<void> => {
      try {
        if (!userId) {
          setVisitsError("Necesitamos tu sesión activa para ver tus visitas.");
          setVisits([]);
          return;
        }

        const visitsData = await getVisitsByUserId(userId);
        const safeVisits = toValidVisits(visitsData);

        setVisits(safeVisits);
        setVisitsError("");
      } catch (error) {
        setVisits([]);
        setVisitsError(error instanceof Error ? error.message : "No se pudieron cargar tus visitas.");
      }
    };

    void fetchVisits();
  }, [userId]);

  useEffect(() => {
    const fetchClaimedCoupons = async (): Promise<void> => {
      if (activeView !== "myCoupons") {
        return;
      }

      try {
        if (!userId) {
          setClaimedCouponsError("Necesitamos tu sesión activa para ver tus cupones.");
          setClaimedCoupons([]);
          return;
        }

        setIsLoadingCoupons(true);
        setClaimedCouponsError("");

        const coupons = await getClaimedCouponsByUser(userId);
        const safeCoupons = toValidCoupons(coupons);
        setClaimedCoupons(safeCoupons);
      } catch (error) {
        setClaimedCoupons([]);
        setClaimedCouponsError(error instanceof Error ? error.message : "No se pudieron cargar tus cupones.");
      } finally {
        setIsLoadingCoupons(false);
      }
    };

    void fetchClaimedCoupons();
  }, [activeView, userId]);

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
        {activeView === "overview" ? (
          <CouponsPageHeader
            theme={theme}
            title="Hola"
            userName={userName}
            subtitle="Buen día"
          />
        ) : (
          <CouponsPageHeader
            theme={theme}
            title="Mis cupones reclamados"
            subtitle="Estos cupones ya son tuyos."
            showAvatar={false}
            onBack={() => setActiveView("overview")}
            backLabel="Volver a inicio"
          />
        )}

        {activeView === "overview" ? (
          <main className="mt-8 space-y-5">
            {visitsError ? (
              <section
                className="rounded-2xl px-5 py-4 shadow-[0_14px_28px_rgba(0,0,0,0.2)] border"
                style={{ backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }}
              >
                <p className="text-sm font-semibold text-red-500">{visitsError}</p>
              </section>
            ) : null}

            {visits.map((visit, index) => (
              <section
                key={`${visit.Business_Id}-${visit.User_Id}-${index}`}
                className="rounded-2xl px-5 py-4 shadow-[0_14px_28px_rgba(0,0,0,0.2)] border"
                style={{ backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-lg font-extrabold">Mis visitas en {visit.BusinessName ?? "Negocio"}</p>
                  <span className="text-sm font-semibold">{visit.VisitCount ?? 0}/{visit.MinVisits ?? 0}</span>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-2">
                    {Array.from({ length: Math.max(visit.MinVisits ?? 0, 0) }, (_, currentIndex) => currentIndex + 1).map((step) => (
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
                  {visit.VisitCount ?? 0}/{visit.MinVisits ?? 0} visitas
                </p>
              </section>
            ))}

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
                  style={{ backgroundColor: theme.accent, color: theme.textPrimary }}
                >
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
                onClick={() => setActiveView("myCoupons")}
              >
                <img src={cuponsito} alt="Mis cupones" className="h-12 w-12 object-contain" />
                <span className="mt-2 font-bold text-sm">Mis cupones</span>
              </button>
            </div>
          </main>
        ) : (
          <main className="mt-8 relative space-y-5 pb-10">
            {isLoadingCoupons ? (
              <p className="text-sm font-semibold" style={{ color: theme.textMuted }}>
                Cargando mis cupones...
              </p>
            ) : null}

            {claimedCouponsError ? <p className="text-sm font-semibold text-red-500">{claimedCouponsError}</p> : null}

            {!isLoadingCoupons && !claimedCouponsError && claimedCoupons.length === 0 ? (
              <p className="text-sm font-semibold" style={{ color: theme.textMuted }}>
                Aún no tienes cupones reclamados.
              </p>
            ) : null}

            {claimedCoupons.map((coupon, index) => (
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
                  <p className="text-base font-extrabold">Cupón reclamado</p>
                  <p className="text-sm leading-snug">{coupon.Description}</p>
                  <button
                    type="button"
                    className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold shadow-[0_6px_14px_rgba(0,0,0,0.18)]"
                    style={{ backgroundColor: theme.accent, color: theme.textPrimary }}
                    onClick={() => navigate("/cupones/qr", { state: { coupon } })}
                  >
                    Mostrar QR
                  </button>
                </div>
              </section>
            ))}
          </main>
        )}

        {activeView === "overview" ? <CuponesNav active="inicio" /> : null}
      </div>
    </div>
  );
};

export { HomePage };
export default HomePage;
