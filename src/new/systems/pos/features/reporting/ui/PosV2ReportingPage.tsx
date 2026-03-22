import { useCallback, useEffect, useMemo, useState } from "react";
import { ModernSystemsFactory } from "../../../../../index";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import type { IncomePoint, ReportRange } from "../model/SalesReport";
import type { ReportSummaryViewModel } from "../pages/ReportingInsightsPage";
import "./PosV2ReportingPage.css";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://apipos.ravekh.com/api/";
const TOKEN_KEY = "pos-v2-token";
const BUSINESS_ID_KEY = "pos-v2-business-id";

const moneyFormatter = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 });

const RANGE_OPTIONS: Array<{ value: ReportRange; label: string }> = [
  { value: "DAY", label: "Hoy" },
  { value: "MONTH", label: "Mes" },
  { value: "YEAR", label: "Año" },
];

const DEFAULT_SUMMARY: ReportSummaryViewModel = {
  balance: 0,
  income: 0,
  earnings: 0,
  averageSale: 0,
  totalSales: 0,
  cashSalesPercentage: 0,
  cardSalesPercentage: 0,
  bestSeller: "Sin datos",
  bestCategory: "Sin datos",
};

type ToastState = { type: "success" | "error"; message: string } | null;

type TrendPoint = IncomePoint & {
  widthPercentage: number;
  deltaLabel: string;
};

const clampPercentage = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Number(value.toFixed(1))));
};

const normalizeSeries = (series: IncomePoint[]): TrendPoint[] => {
  if (series.length === 0) return [];

  const highestAmount = Math.max(...series.map((point) => Math.abs(Number(point.amount) || 0)), 1);

  return series.map((point, index) => {
    const currentAmount = Number(point.amount) || 0;
    const previousAmount = index > 0 ? Number(series[index - 1]?.amount || 0) : currentAmount;
    const difference = currentAmount - previousAmount;

    return {
      ...point,
      widthPercentage: Math.max((Math.abs(currentAmount) / highestAmount) * 100, 8),
      deltaLabel: index === 0 ? "Base" : `${difference >= 0 ? "+" : ""}${moneyFormatter.format(difference)}`,
    };
  });
};

export const PosV2ReportingPage = () => {
  const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_KEY) ?? "");
  const [businessIdInput, setBusinessIdInput] = useState(() => window.localStorage.getItem(BUSINESS_ID_KEY) ?? "");
  const [range, setRange] = useState<ReportRange>("MONTH");
  const [summary, setSummary] = useState<ReportSummaryViewModel>(DEFAULT_SUMMARY);
  const [series, setSeries] = useState<IncomePoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<TrendPoint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const page = useMemo(() => {
    const factory = new ModernSystemsFactory(API_BASE_URL);
    return factory.createPosReportingPage();
  }, []);

  const businessId = Number(businessIdInput);
  const cleanToken = token.trim();
  const hasSession = Boolean(cleanToken) && Number.isFinite(businessId) && businessId > 0;

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timeout = window.setTimeout(() => setToast(null), 3400);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const loadReporting = useCallback(async () => {
    if (!hasSession) {
      setError("Ingresa token y business id para consultar reportes.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [summaryData, incomeSeries] = await Promise.all([
        page.loadSummary(businessId, range, cleanToken),
        page.loadIncomeSeries(businessId, range, cleanToken),
      ]);

      setSummary(summaryData);
      setSeries(incomeSeries);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "No se pudieron cargar los reportes.";
      setError(message);
      showToast("error", message);
    } finally {
      setLoading(false);
    }
  }, [businessId, cleanToken, hasSession, page, range, showToast]);

  useEffect(() => {
    if (hasSession) {
      loadReporting();
    }
  }, [hasSession, loadReporting]);

  const handleSaveSession = useCallback(() => {
    if (!hasSession) {
      setError("Completa token y business id válidos para conectar.");
      return;
    }

    window.localStorage.setItem(TOKEN_KEY, cleanToken);
    window.localStorage.setItem(BUSINESS_ID_KEY, String(businessId));
    setError(null);
    showToast("success", "Sesión conectada para reportes.");
    loadReporting();
  }, [businessId, cleanToken, hasSession, loadReporting, showToast]);

  const trendData = useMemo(() => normalizeSeries(series), [series]);

  const derivedKpis = useMemo(
    () => ({
      margin: summary.income > 0 ? clampPercentage((summary.earnings / summary.income) * 100) : 0,
      avgPerChannel: summary.totalSales > 0 ? summary.income / summary.totalSales : 0,
      cashRatio: clampPercentage(summary.cashSalesPercentage),
      cardRatio: clampPercentage(summary.cardSalesPercentage),
    }),
    [summary],
  );

  const statCards = useMemo(
    () => [
      { label: "Balance", value: moneyFormatter.format(summary.balance) },
      { label: "Ingresos", value: moneyFormatter.format(summary.income) },
      { label: "Ganancia", value: moneyFormatter.format(summary.earnings) },
      { label: "Ticket promedio", value: moneyFormatter.format(summary.averageSale) },
      { label: "Total ventas", value: String(summary.totalSales) },
    ],
    [summary],
  );

  return (
    <PosV2Shell title="Reportes" subtitle="Analítica operacional v2 enfocada en decisiones rápidas y desacoplada del legacy">
      <section className="pos-v2-reporting">
        <header className="pos-v2-reporting__header">
          <div>
            <h2>Insights de ventas</h2>
            <p>Métricas accionables, tendencia visual y lectura clara para móvil, tablet y desktop.</p>
          </div>
          <div className="pos-v2-reporting__filters">
            <label>
              Rango
              <select value={range} onChange={(event) => setRange(event.target.value as ReportRange)}>
                {RANGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <button type="button" onClick={loadReporting} disabled={loading || !hasSession}>{loading ? "Actualizando..." : "Actualizar"}</button>
          </div>
        </header>

        <section className="pos-v2-reporting__session">
          <label>
            Token
            <input value={token} onChange={(event) => setToken(event.target.value)} placeholder="Token POS v2" />
          </label>
          <label>
            Business ID
            <input value={businessIdInput} onChange={(event) => setBusinessIdInput(event.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" placeholder="Ej. 12" />
          </label>
          <button type="button" onClick={handleSaveSession}>Conectar</button>
        </section>

        {error ? <p className="pos-v2-reporting__error">{error}</p> : null}
        {toast ? <p className={`pos-v2-reporting__toast is-${toast.type}`}>{toast.message}</p> : null}

        <section className="pos-v2-reporting__legend" aria-label="Leyenda de reportes">
          <span><i className="is-cash" />Efectivo</span>
          <span><i className="is-card" />Tarjeta</span>
          <span><i className="is-trend" />Tendencia de ingresos</span>
        </section>

        <section className="pos-v2-reporting__stats">
          {statCards.map((card) => (
            <article key={card.label}><span>{card.label}</span><strong>{card.value}</strong></article>
          ))}
        </section>

        <section className="pos-v2-reporting__content">
          <article className="pos-v2-reporting__card">
            <h3>Mix de cobro</h3>
            <div className="pos-v2-reporting__progress">
              <span style={{ width: `${derivedKpis.cashRatio}%` }} />
              <span style={{ width: `${derivedKpis.cardRatio}%` }} />
            </div>
            <p>Efectivo: <strong>{derivedKpis.cashRatio}%</strong></p>
            <p>Tarjeta: <strong>{derivedKpis.cardRatio}%</strong></p>
          </article>

          <article className="pos-v2-reporting__card">
            <h3>Rentabilidad</h3>
            <p>Margen bruto: <strong>{derivedKpis.margin}%</strong></p>
            <p>Ingreso por venta: <strong>{moneyFormatter.format(derivedKpis.avgPerChannel)}</strong></p>
          </article>

          <article className="pos-v2-reporting__card">
            <h3>Top desempeño</h3>
            <p>Producto más vendido: <strong>{summary.bestSeller}</strong></p>
            <p>Categoría líder: <strong>{summary.bestCategory}</strong></p>
          </article>

          <article className="pos-v2-reporting__card is-full">
            <header>
              <h3>Serie de ingresos</h3>
              <span>{trendData.length} puntos</span>
            </header>
            {trendData.length === 0 ? <p className="is-empty">Sin puntos de ingreso para este rango.</p> : (
              <ul>
                {trendData.map((point, index) => (
                  <li key={`${point.dateLabel}-${index}`}>
                    <button type="button" className="pos-v2-reporting__point" onClick={() => setSelectedPoint(point)}>
                      <div>
                        <span>{point.dateLabel || `Punto ${index + 1}`}</span>
                        <small>{point.deltaLabel}</small>
                      </div>
                      <div className="pos-v2-reporting__bar">
                        <span style={{ width: `${point.widthPercentage}%` }} />
                      </div>
                      <strong>{moneyFormatter.format(point.amount)}</strong>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>

        {selectedPoint ? (
          <section className="pos-v2-reporting__modal" role="dialog" aria-modal="true" aria-label="Detalle de punto de ingreso">
            <article>
              <header>
                <h3>{selectedPoint.dateLabel}</h3>
                <button type="button" onClick={() => setSelectedPoint(null)} aria-label="Cerrar detalle">✕</button>
              </header>
              <p>Monto: <strong>{moneyFormatter.format(selectedPoint.amount)}</strong></p>
              <p>Variación: <strong>{selectedPoint.deltaLabel}</strong></p>
            </article>
          </section>
        ) : null}
      </section>
    </PosV2Shell>
  );
};
