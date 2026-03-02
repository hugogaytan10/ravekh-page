import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";
import { ThemeLight } from "../../PuntoVenta/Theme/Theme";
import { ChevronBack } from "../../../../assets/POS/ChevronBack";
import filterIcon from "../../../../assets/filter-solid.svg";
import { getVisitsByBusiness } from "../Petitions";
import type { Visit } from "../types";

type TopClientsSort = "mostFrequent" | "leastFrequent";

export const VisitsTopClientsScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const context = useContext(AppContext);

  const businessId = Number(context.user?.Business_Id || 0);
  const accentColor = context.store?.Color || ThemeLight.btnBackground;

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [topClients, setTopClients] = useState<Visit[]>([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [sort, setSort] = useState<TopClientsSort>("mostFrequent");

  const load = useCallback(async () => {
    if (!businessId) {
      setTopClients([]);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const visits = await getVisitsByBusiness(businessId, context.user?.Token);
      setTopClients(visits);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo completar la operación.");
    } finally {
      setIsLoading(false);
    }
  }, [businessId, context.user?.Token]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setIsFilterVisible(false);
  }, [location.pathname]);

  const sortedVisits = useMemo(() => {
    const normalized = topClients.map((visit) => ({
      ...visit,
      MinVisits: Number(visit.MinVisits || 0),
      VisitCount: Number(visit.VisitCount || 0),
      TotalVisits: Number(visit.TotalVisits || 0),
    }));

    return [...normalized].sort((a, b) =>
      sort === "mostFrequent" ? b.TotalVisits - a.TotalVisits : a.TotalVisits - b.TotalVisits,
    );
  }, [sort, topClients]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/cuponespv/visitas");
  };

  return (
    <div className="min-h-full" style={{ backgroundColor: ThemeLight.backgrounColor }}>
      <div className="px-5 py-5 max-w-xl mx-auto">
        <header className="flex items-center justify-between gap-2 mb-5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBack}
              className="rounded-full p-1 hover:bg-gray-200 transition"
              aria-label="Regresar"
            >
              <ChevronBack width={24} height={24} />
            </button>
            <h1 className="text-[18px] font-semibold text-[#565656]">Top clientes fieles</h1>
          </div>

          <button
            type="button"
            onClick={() => setIsFilterVisible(true)}
            className="rounded-full p-2 hover:bg-gray-200 transition"
            aria-label="Abrir filtros"
          >
            <img src={filterIcon} alt="Filtros" className="w-5 h-5" />
          </button>
        </header>

        <p className="text-[13px] text-[#7A7A7A] mb-4">Aquí podrás ver el top de tus clientes fieles.</p>

        <section className="space-y-3">
          {sortedVisits.map((visit, index) => {
            const minVisits = Math.max(Number(visit.MinVisits || 0), 0);
            const visitCount = Math.max(Number(visit.VisitCount || 0), 0);
            const steps = Array.from({ length: minVisits }, (_, i) => i + 1);

            return (
              <article key={`${visit.User_Id}-${index}`} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[14px] font-semibold text-[#565656]">{visit.UserName || "Cliente"}</p>
                  <p className="text-[13px] font-medium text-[#565656]">
                    {visitCount}/{minVisits}
                  </p>
                </div>

                {minVisits > 0 ? (
                  <div className="mt-3 flex items-center gap-1">
                    {steps.map((step) => (
                      <div
                        key={`step-${visit.User_Id}-${step}`}
                        className="h-2 flex-1 rounded-full"
                        style={{
                          backgroundColor: step <= visitCount ? accentColor : "#E5E7EB",
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-[12px] text-[#8A8A8A]">Sin meta de visitas configurada.</p>
                )}

                <p className="mt-3 text-[12px] text-[#7A7A7A]">Total de veces visitadas: {visit.TotalVisits || 0}</p>
              </article>
            );
          })}

          {!isLoading && !errorMessage && sortedVisits.length === 0 && (
            <p className="text-[13px] text-[#8A8A8A]">Aún no hay visitas registradas para mostrar el top de clientes.</p>
          )}

          {isLoading && (
            <div className="flex items-center gap-2 py-3">
              <span
                className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent"
                style={{ borderTopColor: accentColor }}
              />
              <p className="text-[13px] text-[#565656]">Cargando...</p>
            </div>
          )}

          {!!errorMessage && <p className="text-[13px] text-red-500">{errorMessage}</p>}
        </section>
      </div>

      {isFilterVisible && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-xl rounded-2xl bg-white p-4 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-[16px] font-semibold text-[#565656]">Filtros</h2>
              <button
                type="button"
                onClick={() => setIsFilterVisible(false)}
                className="rounded-full px-2 text-xl leading-none text-[#565656] hover:bg-gray-100"
                aria-label="Cerrar filtros"
              >
                ×
              </button>
            </div>

            <p className="mb-4 text-[12px] text-[#7A7A7A]">Selecciona tus filtros que más se adapten más a ti</p>

            <button
              type="button"
              className="mb-2 flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-3 text-left"
              onClick={() => {
                setSort("mostFrequent");
                setIsFilterVisible(false);
              }}
            >
              <span className="text-[14px] text-[#565656]">Clientes más fieles</span>
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full border"
                style={{ borderColor: sort === "mostFrequent" ? accentColor : "#D1D5DB" }}
              >
                {sort === "mostFrequent" && (
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
                )}
              </span>
            </button>

            <button
              type="button"
              className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-3 text-left"
              onClick={() => {
                setSort("leastFrequent");
                setIsFilterVisible(false);
              }}
            >
              <span className="text-[14px] text-[#565656]">Clientes menos frecuentes</span>
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full border"
                style={{ borderColor: sort === "leastFrequent" ? accentColor : "#D1D5DB" }}
              >
                {sort === "leastFrequent" && (
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
                )}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
