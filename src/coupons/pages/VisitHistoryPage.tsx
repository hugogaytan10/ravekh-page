import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCouponsTheme } from "../interface/useCouponsTheme";
import type { Visits } from "../models/coupon";
import { CouponsPageHeader } from "../components/CouponsPageHeader";
import { toValidVisits } from "../utils/visitValidation";
import { getVisitHistoryByUserId } from "../services/visitsApi";
import { getCuponesUserId, hasCuponesSession } from "../services/session";

const formatVisitDate = (dateValue?: Date | string) => {
  if (!dateValue) {
    return "Sin fecha";
  }
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return "Sin fecha";
  }
  return parsed.toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getVisitProgress = (visitsCount: number, minVisits?: number) => {
  const safeMinVisits = typeof minVisits === "number" && minVisits > 0 ? minVisits : 0;

  if (!safeMinVisits) {
    return {
      minVisits: 0,
      rewardsUnlocked: 0,
      remainingVisits: 0,
      visitsIntoCycle: 0,
      progress: 0,
    };
  }

  const rewardsUnlocked = Math.floor(visitsCount / safeMinVisits);
  const visitsIntoCycle = visitsCount % safeMinVisits;
  const remainingVisits = safeMinVisits - visitsIntoCycle;
  const progress = Math.round((visitsIntoCycle / safeMinVisits) * 100);

  return {
    minVisits: safeMinVisits,
    rewardsUnlocked,
    remainingVisits,
    visitsIntoCycle,
    progress,
  };
};

const VisitHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useCouponsTheme();
  const [visits, setVisits] = useState<Visits[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!hasCuponesSession()) {
      navigate("/cupones", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const fetchHistory = async (): Promise<void> => {
      try {
        const userId = getCuponesUserId();
        if (typeof userId !== "number" || !Number.isFinite(userId)) {
          setErrorMessage("Necesitamos tu sesión activa para ver el historial.");
          return;
        }
        const history = await getVisitHistoryByUserId(userId);
        setVisits(toValidVisits(history));
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "No se pudo cargar el historial de visitas.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchHistory();
  }, []);

  const groupedVisits = useMemo(() => {
    return visits.reduce<Record<string, Visits[]>>((acc, visit) => {
      const key = visit.BusinessName || "Sin negocio";
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(visit);
      return acc;
    }, {});
  }, [visits]);

  const visitSummary = useMemo(() => {
    const businesses = Object.keys(groupedVisits).length;
    const totalVisits = visits.length;

    const nearestReward = Object.entries(groupedVisits).reduce(
      (best, [businessName, businessVisits]) => {
        const progress = getVisitProgress(businessVisits.length, businessVisits[0]?.MinVisits);

        if (!progress.minVisits) {
          return best;
        }

        if (
          progress.remainingVisits < best.remainingVisits ||
          (progress.remainingVisits === best.remainingVisits && progress.visitsIntoCycle > best.visitsIntoCycle)
        ) {
          return {
            businessName,
            remainingVisits: progress.remainingVisits,
            progressPercentage: progress.progress,
            visitsIntoCycle: progress.visitsIntoCycle,
          };
        }

        return best;
      },
      {
        businessName: "",
        remainingVisits: Number.POSITIVE_INFINITY,
        progressPercentage: 0,
        visitsIntoCycle: 0,
      }
    );

    return {
      businesses,
      totalVisits,
      nearestReward:
        nearestReward.remainingVisits === Number.POSITIVE_INFINITY
          ? null
          : {
              businessName: nearestReward.businessName,
              remainingVisits: nearestReward.remainingVisits,
              progressPercentage: nearestReward.progressPercentage,
            },
    };
  }, [groupedVisits, visits.length]);

  return (
    <div
      className="min-h-screen relative overflow-hidden flex justify-center px-4 pb-24 transition-colors"
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
        <CouponsPageHeader
          theme={theme}
          title="Historial de visitas"
          subtitle="Revisa tus visitas más recientes."
          onBack={() => navigate("/cupones/home")}
          backLabel="Volver a inicio"
        />

        <main className="mt-8 space-y-4">
          {!isLoading && !errorMessage && visits.length > 0 ? (
            <section
              className="rounded-2xl px-5 py-4 shadow-[0_14px_28px_rgba(0,0,0,0.2)] border"
              style={{ backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }}
            >
              <p className="text-base font-extrabold">Resumen rápido</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <article className="rounded-xl px-3 py-2 text-center" style={{ backgroundColor: theme.surfaceElevated }}>
                  <p className="text-lg font-extrabold">{visitSummary.totalVisits}</p>
                  <p className="text-[11px] font-semibold" style={{ color: theme.textMuted }}>
                    Visitas
                  </p>
                </article>
                <article className="rounded-xl px-3 py-2 text-center" style={{ backgroundColor: theme.surfaceElevated }}>
                  <p className="text-lg font-extrabold">{visitSummary.businesses}</p>
                  <p className="text-[11px] font-semibold" style={{ color: theme.textMuted }}>
                    Negocios
                  </p>
                </article>
                <article className="rounded-xl px-3 py-2 text-center" style={{ backgroundColor: theme.surfaceElevated }}>
                  <p className="text-lg font-extrabold">
                    {visitSummary.nearestReward ? visitSummary.nearestReward.remainingVisits : "-"}
                  </p>
                  <p className="text-[11px] font-semibold" style={{ color: theme.textMuted }}>
                    Para próxima
                  </p>
                </article>
              </div>
              {visitSummary.nearestReward ? (
                <p className="mt-3 text-xs font-semibold" style={{ color: theme.textMuted }}>
                  En <strong>{visitSummary.nearestReward.businessName}</strong> te faltan {" "}
                  <strong>{visitSummary.nearestReward.remainingVisits}</strong> visita
                  {visitSummary.nearestReward.remainingVisits === 1 ? "" : "s"} para tu próxima recompensa.
                </p>
              ) : null}
            </section>
          ) : null}

          {!isLoading && !errorMessage && visits.length > 0 ? (
            <section
              className="rounded-2xl px-5 py-4 shadow-[0_14px_28px_rgba(0,0,0,0.2)] border"
              style={{ backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }}
            >
              <p className="text-base font-extrabold">¿Cómo leer este historial?</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="rounded-xl px-3 py-2" style={{ backgroundColor: theme.surfaceElevated }}>
                  <span className="font-semibold">1. Encabezado del negocio:</span> muestra cuántas visitas llevas acumuladas.
                </li>
                <li className="rounded-xl px-3 py-2" style={{ backgroundColor: theme.surfaceElevated }}>
                  <span className="font-semibold">2. Ciclo de recompensa:</span> una vez que completas la meta, inicia una nueva para el próximo cupón.
                </li>
                <li className="rounded-xl px-3 py-2" style={{ backgroundColor: theme.surfaceElevated }}>
                  <span className="font-semibold">3. Registro individual:</span> cada fila es una visita con fecha y estado.
                </li>
              </ul>
            </section>
          ) : null}

          {isLoading ? (
            <section
              className="rounded-2xl px-5 py-4 shadow-[0_14px_28px_rgba(0,0,0,0.2)] border text-center"
              style={{ backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }}
            >
              <p className="text-sm font-semibold">Cargando historial...</p>
            </section>
          ) : null}

          {!isLoading && errorMessage ? (
            <section
              className="rounded-2xl px-5 py-4 shadow-[0_14px_28px_rgba(0,0,0,0.2)] border text-center"
              style={{ backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }}
            >
              <p className="text-sm font-semibold">{errorMessage}</p>
            </section>
          ) : null}

          {!isLoading && !errorMessage && visits.length === 0 ? (
            <section
              className="rounded-2xl px-5 py-4 shadow-[0_14px_28px_rgba(0,0,0,0.2)] border text-center"
              style={{ backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }}
            >
              <p className="text-sm font-semibold">Aún no tienes visitas registradas.</p>
            </section>
          ) : null}

          {!isLoading && !errorMessage
            ? Object.entries(groupedVisits).map(([businessName, businessVisits]) => {
                const visitsCount = businessVisits.length;
                const progress = getVisitProgress(visitsCount, businessVisits[0]?.MinVisits);

                return (
                  <section
                    key={businessName}
                    className="rounded-2xl px-5 py-4 shadow-[0_14px_28px_rgba(0,0,0,0.2)] border"
                    style={{ backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-base font-extrabold">{businessName}</p>
                      <span className="text-xs font-semibold" style={{ color: theme.textMuted }}>
                        {visitsCount} visitas
                      </span>
                    </div>

                    {progress.minVisits > 0 ? (
                      <div className="mt-3 rounded-xl px-3 py-3" style={{ backgroundColor: theme.surfaceElevated }}>
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span style={{ color: theme.textMuted }}>Meta {progress.minVisits} visitas</span>
                          <span>{progress.progress}% del ciclo actual</span>
                        </div>
                        <div
                          className="mt-2 h-2 w-full overflow-hidden rounded-full"
                          style={{ backgroundColor: theme.border }}
                          aria-label={`Avance para recompensa en ${businessName}`}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress.progress}%`, backgroundColor: theme.accent }}
                          />
                        </div>
                        <p className="mt-2 text-xs font-semibold" style={{ color: theme.textMuted }}>
                          Te faltan {progress.remainingVisits} visita{progress.remainingVisits === 1 ? "" : "s"} para tu próxima recompensa.
                        </p>
                        {progress.rewardsUnlocked > 0 ? (
                          <p className="mt-1 text-xs font-semibold" style={{ color: theme.textMuted }}>
                            Recompensas acumuladas: {progress.rewardsUnlocked}
                          </p>
                        ) : null}
                      </div>
                    ) : null}

                    <ul className="mt-3 space-y-2">
                      {businessVisits.map((visit, index) => {
                        const visitNumber = visitsCount - index;
                        return (
                          <li
                            key={`${businessName}-${index}`}
                            className="flex items-center justify-between gap-3 rounded-xl px-3 py-2"
                            style={{ backgroundColor: theme.surfaceElevated }}
                          >
                            <div>
                              <p className="text-sm font-semibold">{formatVisitDate(visit.Date)}</p>
                              <p className="text-[11px] font-semibold" style={{ color: theme.textMuted }}>
                                Visita #{visitNumber}
                              </p>
                            </div>
                            <span
                              className="rounded-full px-2 py-1 text-[11px] font-semibold"
                              style={{ backgroundColor: theme.accentSoft, color: theme.textPrimary }}
                            >
                              Registrada
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                );
              })
            : null}
        </main>
      </div>
    </div>
  );
};

export { VisitHistoryPage };
export default VisitHistoryPage;
