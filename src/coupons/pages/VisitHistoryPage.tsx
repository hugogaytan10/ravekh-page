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

    fetchHistory();
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
            ? Object.entries(groupedVisits).map(([businessName, businessVisits]) => (
                <section
                  key={businessName}
                  className="rounded-2xl px-5 py-4 shadow-[0_14px_28px_rgba(0,0,0,0.2)] border"
                  style={{ backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-base font-extrabold">{businessName}</p>
                    <span className="text-xs font-semibold" style={{ color: theme.textMuted }}>
                      {businessVisits.length} visitas
                    </span>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {businessVisits.map((visit, index) => (
                      <li
                        key={`${businessName}-${index}`}
                        className="flex items-center justify-between rounded-xl px-3 py-2"
                        style={{ backgroundColor: theme.surfaceElevated }}
                      >
                        <span className="text-sm font-semibold">{formatVisitDate(visit.Date)}</span>
                        <span className="text-xs font-semibold" style={{ color: theme.textMuted }}>
                          Meta {visit.MinVisits ?? 0}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))
            : null}
        </main>
      </div>
    </div>
  );
};

export { VisitHistoryPage };
export default VisitHistoryPage;
