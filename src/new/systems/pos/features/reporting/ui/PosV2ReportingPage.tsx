import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ModernSystemsFactory } from "../../../../../index";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import type { IncomePoint, ReportRange, ReportSale } from "../model/SalesReport";
import type { ReportSummaryViewModel } from "../pages/ReportingInsightsPage";
import "./PosV2ReportingPage.css";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://apipos.ravekh.com/api/";
const TOKEN_KEY = "pos-v2-token";
const BUSINESS_ID_KEY = "pos-v2-business-id";

const moneyFormatter = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 });
const dateFormatter = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" });

const RANGE_OPTIONS: Array<{ value: ReportRange; label: string }> = [
  { value: "DAY", label: "Hoy" },
  { value: "MONTH", label: "Mes" },
  { value: "YEAR", label: "Año" },
];

const PAYMENT_OPTIONS: Array<{ value: "TODOS" | "EFECTIVO" | "TARJETA"; label: string }> = [
  { value: "TODOS", label: "Todos" },
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "TARJETA", label: "Tarjeta" },
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

type EndpointTiming = {
  key: "summary" | "series" | "sales";
  label: string;
  endpoint: string;
  durationMs: number;
  available: boolean;
};

type PerformanceSnapshot = {
  summaryMs: number;
  seriesMs: number;
  salesMs: number;
  totalMs: number;
  updatedAt: string;
};

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

const formatDate = (value: string): string => {
  if (!value) return "Sin fecha";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return dateFormatter.format(parsed);
};

export const PosV2ReportingPage = () => {
  const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_KEY) ?? "");
  const [businessIdInput, setBusinessIdInput] = useState(() => window.localStorage.getItem(BUSINESS_ID_KEY) ?? "");
  const [range, setRange] = useState<ReportRange>("MONTH");
  const [paymentFilter, setPaymentFilter] = useState<"TODOS" | "EFECTIVO" | "TARJETA">("TODOS");
  const [summary, setSummary] = useState<ReportSummaryViewModel>(DEFAULT_SUMMARY);
  const [series, setSeries] = useState<IncomePoint[]>([]);
  const [sales, setSales] = useState<ReportSale[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<TrendPoint | null>(null);
  const [loading, setLoading] = useState(false);
  const [salesLoading, setSalesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [perfSnapshot, setPerfSnapshot] = useState<PerformanceSnapshot | null>(null);
  const reportRequestRef = useRef(0);
  const salesRequestRef = useRef(0);

  const page = useMemo(() => {
    const factory = new ModernSystemsFactory(API_BASE_URL);
    return factory.createPosReportingPage();
  }, []);

  const businessId = Number(businessIdInput);
  const cleanToken = token.trim();
  const hasBusinessId = Number.isFinite(businessId) && businessId > 0;
  const hasToken = cleanToken.length > 0;
  const navigate = useNavigate();

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timeout = window.setTimeout(() => setToast(null), 3400);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const loadReporting = useCallback(async () => {
    if (!hasBusinessId) {
      setError("Ingresa business id para consultar reportes.");
      return;
    }

    const reportRequestId = reportRequestRef.current + 1;
    reportRequestRef.current = reportRequestId;
    const loadStartedAt = window.performance.now();
    setLoading(true);
    setError(null);

    try {
      const summaryStartedAt = window.performance.now();
      const summaryPromise = page
        .loadSummary(businessId, range, hasToken ? cleanToken : undefined)
        .then((summaryData) => ({
          summaryData,
          summaryMs: Math.round(window.performance.now() - summaryStartedAt),
        }));

      const seriesStartedAt = window.performance.now();
      const seriesPromise = page
        .loadIncomeSeries(businessId, range, hasToken ? cleanToken : undefined)
        .then((incomeSeries) => ({
          incomeSeries,
          seriesMs: Math.round(window.performance.now() - seriesStartedAt),
        }));

      const [{ summaryData, summaryMs }, { incomeSeries, seriesMs }] = await Promise.all([summaryPromise, seriesPromise]);

      if (reportRequestRef.current !== reportRequestId) {
        return;
      }

      setSummary(summaryData);
      setSeries(incomeSeries);
      setPerfSnapshot((previousPerformance) => ({
        summaryMs,
        seriesMs,
        salesMs: previousPerformance?.salesMs ?? 0,
        totalMs: Math.round(window.performance.now() - loadStartedAt),
        updatedAt: new Date().toISOString(),
      }));
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "No se pudieron cargar los reportes.";
      if (reportRequestRef.current === reportRequestId) {
        setError(message);
        showToast("error", message);
      }
    } finally {
      if (reportRequestRef.current === reportRequestId) {
        setLoading(false);
      }
    }
  }, [businessId, cleanToken, hasBusinessId, page, range, showToast]);

  const loadSales = useCallback(async () => {
    if (!hasBusinessId || !hasToken) {
      setSales([]);
      return;
    }

    const salesRequestId = salesRequestRef.current + 1;
    salesRequestRef.current = salesRequestId;
    const salesStartedAt = window.performance.now();
    setSalesLoading(true);
    try {
      const details = await page.loadSalesDetails(businessId, range, paymentFilter, cleanToken);
      if (salesRequestRef.current !== salesRequestId) {
        return;
      }
      setSales(details);
      setPerfSnapshot((previousPerformance) => ({
        summaryMs: previousPerformance?.summaryMs ?? 0,
        seriesMs: previousPerformance?.seriesMs ?? 0,
        salesMs: Math.round(window.performance.now() - salesStartedAt),
        totalMs: previousPerformance?.totalMs ?? 0,
        updatedAt: new Date().toISOString(),
      }));
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "No se pudieron cargar ventas detalladas.";
      if (salesRequestRef.current === salesRequestId) {
        showToast("error", message);
      }
    } finally {
      if (salesRequestRef.current === salesRequestId) {
        setSalesLoading(false);
      }
    }
  }, [businessId, cleanToken, hasBusinessId, hasToken, page, paymentFilter, range, showToast]);

  useEffect(() => {
    if (hasBusinessId) {
      loadReporting();
    }
  }, [hasBusinessId, loadReporting]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const handleSaveSession = useCallback(() => {
    if (!hasBusinessId) {
      setError("Completa business id válido para conectar.");
      return;
    }

    window.localStorage.setItem(BUSINESS_ID_KEY, String(businessId));
    if (hasToken) {
      window.localStorage.setItem(TOKEN_KEY, cleanToken);
    }
    setError(null);
    showToast("success", "Sesión conectada para reportes.");
    loadReporting();
    loadSales();
  }, [businessId, cleanToken, hasBusinessId, hasToken, loadReporting, loadSales, showToast]);

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

  const endpointTimings = useMemo<EndpointTiming[]>(() => {
    const rangeSuffix = range === "DAY" ? "today" : range === "MONTH" ? "month" : "year";

    return [
      {
        key: "summary",
        label: "Resumen",
        endpoint: `GET /report/${hasBusinessId ? businessId : "{businessId}"}`,
        durationMs: perfSnapshot?.summaryMs ?? 0,
        available: hasBusinessId && !!perfSnapshot,
      },
      {
        key: "series",
        label: "Serie ingresos",
        endpoint: `GET /income/${rangeSuffix}/${hasBusinessId ? businessId : "{businessId}"}`,
        durationMs: perfSnapshot?.seriesMs ?? 0,
        available: hasBusinessId && !!perfSnapshot,
      },
      {
        key: "sales",
        label: "Ventas por pago",
        endpoint: "POST /sales/payment",
        durationMs: perfSnapshot?.salesMs ?? 0,
        available: hasBusinessId && hasToken && !!perfSnapshot,
      },
    ];
  }, [businessId, hasBusinessId, hasToken, perfSnapshot, range]);

  const slowestEndpoint = useMemo(() => {
    const availableTimings = endpointTimings.filter((item) => item.available);
    if (availableTimings.length === 0) return null;

    return [...availableTimings].sort((a, b) => b.durationMs - a.durationMs)[0];
  }, [endpointTimings]);

  return (
    <PosV2Shell title="Reportes" subtitle="Analítica operacional v2 enfocada en decisiones rápidas y desacoplada del legacy">
      <section className="pos-v2-reporting">
        <header className="pos-v2-reporting__header">
          <div>
            <h2>Insights de ventas</h2>
            <p>Métricas accionables, tendencia visual y lectura clara para móvil, tablet y desktop.</p>
          </div>
          <div className="pos-v2-reporting__filters">
            <button type="button" className="pos-v2-reporting__back" onClick={() => navigate("/v2/MainSales")}>
              ← Volver a Ventas
            </button>
            <label>
              Rango
              <select value={range} onChange={(event) => setRange(event.target.value as ReportRange)}>
                {RANGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <button type="button" onClick={loadReporting} disabled={loading || !hasBusinessId}>{loading ? "Actualizando..." : "Actualizar"}</button>
          </div>
        </header>

        <section className="pos-v2-reporting__session">
          <label>
            Token (opcional para resumen)
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

        {perfSnapshot ? (
          <section className="pos-v2-reporting__perf" aria-label="Métricas de rendimiento en cliente">
            <h3>Tiempos por endpoint</h3>
            <div>
              {endpointTimings.map((timing) => (
                <p key={timing.key}>
                  <span>{timing.endpoint}</span>
                  <strong>{timing.available ? `${timing.durationMs} ms` : "N/D"}</strong>
                </p>
              ))}
            </div>
            {slowestEndpoint ? (
              <p className="pos-v2-reporting__perf-winner">
                Más lento: <strong>{slowestEndpoint.label}</strong> ({slowestEndpoint.endpoint}) ·{" "}
                <strong>{slowestEndpoint.durationMs} ms</strong>
              </p>
            ) : (
              <p className="pos-v2-reporting__perf-winner">Conecta businessId/token para medir todos los endpoints.</p>
            )}
            <div>
              <p>Total resumen+serie: <strong>{perfSnapshot.totalMs} ms</strong></p>
            </div>
            <small>Última medición: {formatDate(perfSnapshot.updatedAt)}</small>
          </section>
        ) : null}

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

          <article className="pos-v2-reporting__card is-full">
            <header className="pos-v2-reporting__sales-header">
              <h3>Ventas detalladas (legacy API desacoplada)</h3>
              <div className="pos-v2-reporting__payment-tabs">
                {PAYMENT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={paymentFilter === option.value ? "is-active" : ""}
                    onClick={() => setPaymentFilter(option.value)}
                    disabled={salesLoading || !hasToken}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </header>
            {!hasToken ? <p className="is-empty">Para ventas detalladas ingresa token POS v2.</p> : null}
            {hasToken && salesLoading ? <p className="is-empty">Cargando ventas...</p> : null}
            {hasToken && !salesLoading && sales.length === 0 ? <p className="is-empty">Sin ventas para este rango/filtro.</p> : null}
            {hasToken && sales.length > 0 ? (
              <ul className="pos-v2-reporting__sales-list">
                {sales.slice(0, 12).map((sale) => (
                  <li key={`${sale.type}-${sale.id}`}>
                    <span className={`badge ${sale.type === "ORDER" ? "order" : "command"}`}>
                      {sale.type === "ORDER" ? "Orden" : "Comanda"}
                    </span>
                    <div>
                      <strong>{moneyFormatter.format(sale.total)}</strong>
                      <small>{sale.paymentMethod} · {sale.currency}</small>
                    </div>
                    <time>{formatDate(sale.date)}</time>
                  </li>
                ))}
              </ul>
            ) : null}
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
